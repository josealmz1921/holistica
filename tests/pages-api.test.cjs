const { test } = require("node:test");
const assert = require("node:assert/strict");
const createLoader = require("./load-ts.cjs");

const page = () => ({ schemaVersion: 1, id: "home", title: "Inicio", sections: [{ id: "hero", type: "hero", variant: "left", visible: true, content: { title: "Flor de luna", description: "Bienestar en Pachuca", actions: [] } }] });
function setup() {
    const store = new Map();
    let reads = 0;
    let writes = 0;
    let dbCalls = 0;
    const snapshot = path => ({ exists: store.has(path), data: () => structuredClone(store.get(path)) });
    const db = {
        doc: path => ({ path, get: async () => { reads++; return snapshot(path); } }),
        runTransaction: async callback => {
            const staged = [];
            const result = await callback({
                get: async ref => { reads++; return snapshot(ref.path); },
                set: (ref, data) => staged.push([ref.path, structuredClone(data)]),
            });
            for (const [path, data] of staged) { writes++; store.set(path, data); }
            return result;
        },
    };
    const load = createLoader({
        "server-only": {},
        "./firebaseAdmin": {
            adminAuth: () => ({ verifyIdToken: async (token, revoked) => {
                assert.equal(revoked, true);
                if (token === "expired") throw new Error("Revoked");
                return { uid: "test-admin", admin: token === "admin" ? true : token === "string" ? "true" : false };
            } }),
            adminDb: () => { dbCalls++; return db; },
        },
        "firebase-admin/firestore": { FieldValue: { serverTimestamp: () => "test-server-time" } },
    });
    return { ...load("src/server/pages.ts"), store, counters: () => ({ reads, writes, dbCalls }) };
}
function request(body, token = "admin", method = "PUT") {
    return new Request("https://example.com/api/admin/pages/home", { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(method !== "GET" ? { body: JSON.stringify(body) } : {}) });
}

test("draft reads, saves and publication require real boolean admin and valid unrevoked token before DB access", async () => {
    for (const token of [null, "user", "string", "expired"]) {
        const api = setup();
        for (const operation of [() => api.getPageDraft(request(null, token, "GET")), () => api.writePage(request({ document: page(), revision: 0 }, token), "save"), () => api.writePage(request({ revision: 0 }, token, "POST"), "publish")]) {
            const result = await operation();
            assert.equal(result.status, !token || token === "expired" ? 401 : 403);
        }
        assert.deepEqual(api.counters(), { reads: 0, writes: 0, dbCalls: 0 });
    }
});

test("saving a draft never changes a published snapshot; publishing rereads and validates the saved draft", async () => {
    const api = setup();
    let result = await api.writePage(request({ document: page(), revision: 0 }), "save");
    assert.equal(result.status, 200);
    assert.equal(api.store.has("pagePublished/home"), false);
    assert.equal(api.store.get("pageDrafts/home").revision, 1);
    result = await api.writePage(request({ revision: 1 }, "admin", "POST"), "publish");
    assert.equal(result.status, 200);
    const published = structuredClone(api.store.get("pagePublished/home"));
    const draft = page(); draft.sections[0].content.title = "Nuevo título";
    assert.equal((await api.writePage(request({ document: draft, revision: 1 }), "save")).status, 200);
    assert.deepEqual(api.store.get("pagePublished/home"), published);
    const response = await api.getPageDraft(request(null, "admin", "GET"));
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.json();
    assert.equal(body.revision, 2); assert.equal(body.publishedRevision, 1);
    assert.equal(body.document.sections[0].content.title, "Nuevo título");
});

test("empty drafts save but cannot publish; invalid stored H1/URL/schema cannot bypass publication validation", async () => {
    const api = setup();
    const draft = page(); draft.sections = [];
    assert.equal((await api.writePage(request({ document: draft, revision: 0 }), "save")).status, 200);
    assert.equal((await api.writePage(request({ revision: 1 }, "admin", "POST"), "publish")).status, 400);
    assert.equal(api.store.has("pagePublished/home"), false);
    for (const change of [p => { p.schemaVersion = 2; }, p => { p.sections.push({ ...p.sections[0], id: "other" }); }, p => { p.sections[0].content.actions = [{ label: "Ir", href: "javascript:alert(1)" }]; }]) {
        const invalid = page(); change(invalid);
        api.store.set("pageDrafts/home", { document: invalid, revision: 2 });
        assert.equal((await api.writePage(request({ revision: 2 }, "admin", "POST"), "publish")).status, 400);
        assert.equal(api.store.has("pagePublished/home"), false);
    }
});

test("client cannot inject a published document, unsupported page IDs or stale revisions", async () => {
    const api = setup();
    assert.equal((await api.writePage(request({ document: page(), revision: 0 }, "admin", "POST"), "publish")).status, 400);
    const other = page(); other.id = "service";
    assert.equal((await api.writePage(request({ document: other, revision: 0 }), "save")).status, 400);
    assert.equal((await api.writePage(request({ document: page(), revision: 0 }), "save")).status, 200);
    assert.equal((await api.writePage(request({ document: page(), revision: 0 }), "save")).status, 409);
    assert.equal((await api.writePage(request({ revision: 0 }, "admin", "POST"), "publish")).status, 409);
    assert.equal((await api.writePage(request({ revision: 1.5 }, "admin", "POST"), "publish")).status, 400);
});

test('site section anchors cannot be overwritten by builder blocks', async () => {
    const api = setup();
    const invalid = page(); invalid.sections[0].id = 'servicios';
    assert.equal((await api.writePage(request({ document: invalid, revision: 0 }), 'save')).status, 400);
    api.store.set('pageDrafts/home', { document: invalid, revision: 1 });
    assert.equal((await api.writePage(request({ revision: 1 }, 'admin', 'POST'), 'publish')).status, 400);
    assert.equal(api.store.has('pagePublished/home'), false);
});

test("image origins and request/document byte limits are enforced in the server", async () => {
    const api = setup();
    const image = page(); image.sections[0].content.image = { src: "https://unapproved.example.com/image.jpg", alt: "Imagen" };
    assert.equal((await api.writePage(request({ document: image, revision: 0 }), "save")).status, 400);
    image.sections[0].content.image.src = "/img/heroImage.jpg";
    assert.equal((await api.writePage(request({ document: image, revision: 0 }), "save")).status, 200);
    assert.equal((await api.writePage(request({ document: { excess: "a".repeat(api.PAGE_MAX_BYTES + 5000) }, revision: 1 }), "save")).status, 413);
    const large = page();
    large.sections.push(...Array.from({ length: 30 }, (_, i) => ({ id: `text-${i}`, type: "text", variant: "left", visible: true, content: { title: "Título", description: "á".repeat(9900) } })));
    assert.throws(() => api.validateStoredPage(large, "draft"), error => error.status === 413);
    assert.equal(api.counters().writes, 1);
});
