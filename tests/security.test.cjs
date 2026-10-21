const { test } = require("node:test");
const assert = require("node:assert/strict");
const createLoader = require("./load-ts.cjs");

test("real Firebase Admin loads and resolves signing keys without require(ESM) support", () => {
    const { spawnSync } = require("node:child_process");
    const result = spawnSync(process.execPath, ["--no-experimental-require-module", "-e", `
        const assert = require('node:assert/strict');
        const { createRequire } = require('node:module');
        const { generateKeyPairSync, createPublicKey } = require('node:crypto');
        assert.equal(typeof require('firebase-admin/auth').getAuth, 'function');
        const adminRequire = createRequire(require.resolve('firebase-admin/auth'));
        const jwksClient = adminRequire('jwks-rsa');
        const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
        const client = jwksClient({ jwksUri: 'https://unused.invalid', cache: false });
        // Local keys only: this regression test never contacts Firebase or a JWKS server.
        client.getKeys = async () => [{ ...publicKey.export({ format: 'jwk' }), kid: 'local', alg: 'RS256', use: 'sig' }];
        client.getSigningKey('local').then(key => {
            assert.deepEqual(
                createPublicKey(key.getPublicKey()).export({ format: 'jwk' }),
                publicKey.export({ format: 'jwk' })
            );
        }).catch(() => { process.exitCode = 1; });
    `], { encoding: "utf8", timeout: 15000 });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
});

function context() {
    const state = { token: { uid: "admin", admin: true }, destroyed: [], signed: [], verified: [], dbCalls: 0, services: [], blog: [], therapist: null };
    const db = {
        collection: name => ({
            doc: id => ({ name, id }),
            get: async () => ({ docs: (state[name] || []).map(data => ({ data: () => data })) }),
        }),
        doc: () => ({ get: async () => ({ data: () => state.therapist }) }),
    };
    const firebase = {
        adminAuth: () => ({ verifyIdToken: async (...args) => {
            state.verified.push(args);
            if (state.invalid) throw new Error("Invalid token");
            return state.token;
        } }),
        adminDb: () => {
            state.dbCalls++;
            if (state.dbError) throw state.dbError;
            return db;
        },
    };
    const cloudinary = {
        uploader: { destroy: async id => { state.destroyed.push(id); return { result: "ok" }; } },
        utils: { api_sign_request: params => { state.signed.push(params); return "test-signature"; } },
    };
    const load = createLoader({ "server-only": {}, "./firebaseAdmin": firebase,
        "@/src/cloudinary/cloudinary": { __esModule: true, default: cloudinary } });
    return { state, load };
}

const request = (body, token = "valid", method = "DELETE") => new Request("https://example.com/api/cloudinary/delete", {
    method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
});

test("delete requires a session before reading body or contacting Cloudinary", async () => {
    const { state, load } = context();
    const response = await load("app/api/cloudinary/delete/route.ts").DELETE(request({ publicId: "holistica/file" }, ""));
    assert.equal(response.status, 401);
    assert.deepEqual(state.destroyed, []);
    assert.equal(state.dbCalls, 0);
});

test("normal authenticated users cannot delete", async () => {
    const { state, load } = context(); state.token.admin = false;
    const response = await load("app/api/cloudinary/delete/route.ts").DELETE(request({ publicId: "holistica/file" }));
    assert.equal(response.status, 403);
    assert.deepEqual(state.destroyed, []);
});

test("invalid, expired or revoked tokens are rejected; revocation is checked", async () => {
    const { state, load } = context(); state.invalid = true;
    const response = await load("app/api/cloudinary/delete/route.ts").DELETE(request({ publicId: "holistica/file" }));
    assert.equal(response.status, 401);
    assert.deepEqual(state.verified, [["valid", true]]);
    assert.deepEqual(state.destroyed, []);
});

test("admins can delete managed assets, not unrelated IDs or path traversal", async () => {
    const { state, load } = context();
    const { DELETE } = load("app/api/cloudinary/delete/route.ts");
    assert.equal((await DELETE(request({ publicId: "holistica/file" }))).status, 200);
    assert.equal((await DELETE(request({ publicId: "unrelated/file" }))).status, 403);
    for (const publicId of ["holistica/../file", "holistica//file", "", 123, "https://evil.test/file"]) {
        assert.equal((await DELETE(request({ publicId }))).status, 400);
    }
    assert.deepEqual(state.destroyed, ["holistica/file"]);
});

test("legacy referenced images remain manageable without enabling account-wide deletion", async () => {
    const { state, load } = context();
    state.services = [{ gallery: [{ publicId: "old-image" }] }];
    state.blog = [{ media: [{ publicId: "legacy/image.v1", resourceType: "image" }] }];
    const { DELETE } = load("app/api/cloudinary/delete/route.ts");
    assert.equal((await DELETE(request({ publicId: "old-image" }))).status, 200);
    assert.equal((await DELETE(request({ publicId: "legacy/image.v1" }))).status, 200);
    assert.equal((await DELETE(request({ publicId: "other-old-image" }))).status, 403);
});

test("JSON input is bounded and malformed bodies return client errors", async () => {
    const { load } = context();
    const { DELETE } = load("app/api/cloudinary/delete/route.ts");
    assert.equal((await DELETE(request({ value: "a".repeat(17000) }))).status, 413);
    const invalid = new Request("https://example.com", { method: "DELETE", headers: { Authorization: "Bearer valid", "Content-Type": "application/json" }, body: "{" });
    assert.equal((await DELETE(invalid)).status, 400);
    const nonJson = new Request("https://example.com", { method: "DELETE", headers: { Authorization: "Bearer valid" }, body: "{}" });
    assert.equal((await DELETE(nonJson)).status, 415);
});

test("rate limits are local, separate users/actions and expire after one minute", async t => {
    let now = 100000;
    t.mock.method(Date, "now", () => now);
    const { load, state } = context();
    const { limitAdminRequests } = load("src/server/adminApi.ts");
    await Promise.all(Array.from({ length: 20 }, () => limitAdminRequests("user", "upload")));
    await assert.rejects(limitAdminRequests("user", "upload"), error => error.status === 429);
    await limitAdminRequests("another-user", "upload");
    await limitAdminRequests("user", "delete");
    now += 59999;
    await assert.rejects(limitAdminRequests("user", "upload"), error => error.status === 429);
    now++;
    await limitAdminRequests("user", "upload");
    assert.equal(state.dbCalls, 0);
    const isolated = context().load("src/server/adminApi.ts");
    await isolated.limitAdminRequests("user", "upload");
});

test("upload signatures require admin and never accept arbitrary signing parameters", async () => {
    const saved = { ...process.env };
    Object.assign(process.env, { CLOUDINARY_API_SECRET: "secret", CLOUDINARY_API_KEY: "key", NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "cloud", CLOUDINARY_IMAGE_UPLOAD_PRESET: "signed-images", CLOUDINARY_VIDEO_UPLOAD_PRESET: "signed-videos", CLOUDINARY_ASSET_FOLDER: "holistica" });
    try {
        const { state, load } = context();
        const { POST } = load("app/api/cloudinary/sign/route.ts");
        assert.equal((await POST(request({ resourceType: "image" }, "", "POST"))).status, 401);
        state.token.admin = false;
        assert.equal((await POST(request({ resourceType: "image" }, "valid", "POST"))).status, 403);
        state.token.admin = true;
        assert.equal((await POST(request({ resourceType: "raw" }, "valid", "POST"))).status, 400);
        const result = await POST(request({ resourceType: "image", folder: "other", public_id: "victim", overwrite: true, upload_preset: "unsigned" }, "valid", "POST"));
        assert.equal(result.status, 200);
        assert.equal(result.headers.get("cache-control"), "no-store");
        const data = await result.json();
        assert.equal(data.params.folder, "holistica");
        assert.equal(data.params.overwrite, false);
        assert.equal(data.params.upload_preset, "signed-images");
        assert.equal(data.params.allowed_formats, "jpg,png");
        assert.notEqual(data.params.public_id, "victim");
        assert(!JSON.stringify(data).includes('"secret"'));
        const video = await (await POST(request({ resourceType: "video" }, "valid", "POST"))).json();
        assert.equal(video.params.upload_preset, "signed-videos");
        assert.equal(video.params.allowed_formats, "mp4,webm");
    } finally { process.env = saved; }
});

test("missing server configuration fails closed without returning internals", async t => {
    const log = t.mock.method(console, "error", () => {});
    const saved = process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
    delete process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
    try {
        const { load } = context();
        const response = await load("app/api/cloudinary/sign/route.ts").POST(request({ resourceType: "image" }, "valid", "POST"));
        assert.equal(response.status, 503);
        assert(!JSON.stringify(await response.json()).includes("stack"));
        assert.equal(log.mock.calls[0].arguments[1].stage, "configuration");
    } finally {
        if (saved === undefined) delete process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
        else process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET = saved;
    }
});

test("upload signatures do not access Firestore even when its credentials lack data permissions", async () => {
    const saved = { ...process.env };
    Object.assign(process.env, { CLOUDINARY_API_SECRET: "secret", CLOUDINARY_API_KEY: "key", NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "cloud", CLOUDINARY_IMAGE_UPLOAD_PRESET: "signed-images", CLOUDINARY_ASSET_FOLDER: "holistica" });
    const { state, load } = context();
    state.dbError = Object.assign(new Error("PRIVATE_ERROR_CONTENT"), { code: 7 });
    try {
        const { POST } = load("app/api/cloudinary/sign/route.ts");
        const response = await POST(request({ resourceType: "image" }, "valid", "POST"));
        assert.equal(response.status, 200);
        assert.equal(state.dbCalls, 0);
        assert(!JSON.stringify(await response.json()).includes("PRIVATE_ERROR_CONTENT"));
        assert.equal(state.signed.length, 1);
        for (let i = 1; i < 20; i++) {
            assert.equal((await POST(request({ resourceType: "image" }, "valid", "POST"))).status, 200);
        }
        assert.equal((await POST(request({ resourceType: "image" }, "valid", "POST"))).status, 429);
        assert.equal(state.signed.length, 20);
        assert.equal(state.dbCalls, 0);
    } finally { process.env = saved; }
});

test("local counters bound memory without discarding active limits and reclaim expired entries", async t => {
    let now = 100000;
    t.mock.method(Date, "now", () => now);
    const { limitAdminRequests } = context().load("src/server/adminApi.ts");
    for (let i = 0; i < 10000; i++) await limitAdminRequests(`user-${i}`, "upload", 1);
    await assert.rejects(limitAdminRequests("overflow", "upload"), error => error.status === 503);
    await assert.rejects(limitAdminRequests("user-0", "upload", 1), error => error.status === 429);
    now += 60000;
    await limitAdminRequests("overflow", "upload");
});

test("upload client surfaces the safe API error and status without attempting a Cloudinary upload", async t => {
    const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ error: "Servicio temporalmente no disponible." }, { status: 503 }));
    const load = createLoader({ "@/src/firebase/adminRequest": { adminHeaders: async () => ({ Authorization: "Bearer test-token" }) } });
    const { uploadImage } = load("src/utilities/cloudinary.ts");
    await assert.rejects(uploadImage(new File(["example"], "image.png", { type: "image/png" })), /Servicio temporalmente no disponible\. \(HTTP 503\)/);
    assert.equal(fetch.mock.calls.length, 1);
});
