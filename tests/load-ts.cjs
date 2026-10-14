const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Isolated TypeScript loader: server-only and external services are replaced by test doubles.
module.exports = function createLoader(mocks = {}) {
    const cache = new Map();
    function load(filename) {
        const file = path.resolve(__dirname, "..", filename);
        if (cache.has(file)) return cache.get(file).exports;
        const loaded = { exports: {} };
        cache.set(file, loaded);
        const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        }).outputText;
        const requireModule = id => {
            if (Object.hasOwn(mocks, id)) return mocks[id];
            if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`);
            if (id.startsWith(".")) return load(path.resolve(path.dirname(file), `${id}.ts`));
            return require(id);
        };
        new Function("require", "module", "exports", code)(requireModule, loaded, loaded.exports);
        return loaded.exports;
    }
    return load;
};
