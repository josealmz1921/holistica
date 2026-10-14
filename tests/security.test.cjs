const { test } = require("node:test");
const assert = require("node:assert/strict");
const createLoader = require("./load-ts.cjs");

function context() {
    const state = { token: { uid: "admin", admin: true }, destroyed: [], signed: [], verified: [], counters: new Map(), services: [], blog: [], therapist: null };
    const db = {
        collection: name => ({
            doc: id => ({ name, id }),
            get: async () => ({ docs: (state[name] || []).map(data => ({ data: () => data })) }),
        }),
        doc: () => ({ get: async () => ({ data: () => state.therapist }) }),
        runTransaction: async fn => fn({
            get: async ref => ({ data: () => state.counters.get(ref.id) }),
            set: (ref, data) => state.counters.set(ref.id, data),
        }),
    };
    const firebase = {
        adminAuth: () => ({ verifyIdToken: async (...args) => {
            state.verified.push(args);
            if (state.invalid) throw new Error("Invalid token");
            return state.token;
        } }),
        adminDb: () => db,
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
    assert.equal(state.counters.size, 0);
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

test("rate limits persist in shared storage and return 429", async () => {
    const { load } = context();
    const { limitAdminRequests } = load("src/server/adminApi.ts");
    await limitAdminRequests("user", "delete", 1);
    await assert.rejects(limitAdminRequests("user", "delete", 1), error => error.status === 429);
    await limitAdminRequests("another-user", "delete", 1);
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

test("missing server configuration fails closed without returning internals", async () => {
    const saved = process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
    delete process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
    try {
        const { load } = context();
        const response = await load("app/api/cloudinary/sign/route.ts").POST(request({ resourceType: "image" }, "valid", "POST"));
        assert.equal(response.status, 503);
        assert(!JSON.stringify(await response.json()).includes("stack"));
    } finally {
        if (saved === undefined) delete process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
        else process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET = saved;
    }
});
