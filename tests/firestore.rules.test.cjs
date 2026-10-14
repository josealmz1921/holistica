const { test, before, beforeEach, after } = require("node:test");
const fs = require("node:fs");
const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, serverTimestamp, Timestamp, setLogLevel } = require("firebase/firestore");

let env;
const date = Timestamp.fromDate(new Date("2026-01-01T00:00:00Z"));
const service = { name: "Sesión", slug: "sesion", category: "category", description: "Descripción", duration: 60, active: true, message: "Reserva", gallery: [], benefits: [], route: [], createdAt: date, updatedAt: date };
const post = { title: "Entrada", slug: "entrada", excerpt: "Resumen", published: true, content: { blocks: [] }, media: [], createdAt: date, publishedAt: date, updatedAt: date };
const category = { name: "Categoría", slug: "categoria", active: true, createdAt: date, updatedAt: date };
const profile = { name: "Terapeuta", specialty: "Bienestar", description: "Presentación", photo: null, updatedAt: date };

before(async () => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("Run this suite through Firebase emulators:exec; production access is never allowed.");
    setLogLevel("silent");
    env = await initializeTestEnvironment({ projectId: "demo-holistica-security", firestore: { rules: fs.readFileSync("firestore.rules", "utf8") } });
});
beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async context => {
        const db = context.firestore();
        await Promise.all([
            setDoc(doc(db, "services", "active"), service),
            setDoc(doc(db, "services", "inactive"), { ...service, active: false }),
            setDoc(doc(db, "blog", "published"), post),
            setDoc(doc(db, "blog", "draft"), { ...post, published: false }),
            setDoc(doc(db, "categories", "category"), category),
            setDoc(doc(db, "content", "therapist"), profile),
        ]);
    });
});
after(async () => { if (env) await env.cleanup(); });

test("anonymous users can read only published posts and active services", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "blog", "published")));
    await assertSucceeds(getDoc(doc(db, "services", "active")));
    await assertFails(getDoc(doc(db, "blog", "draft")));
    await assertFails(getDoc(doc(db, "services", "inactive")));
    await assertSucceeds(getDocs(query(collection(db, "blog"), where("published", "==", true))));
    await assertSucceeds(getDocs(query(collection(db, "services"), where("active", "==", true))));
    await assertFails(getDocs(collection(db, "blog")));
    await assertFails(getDocs(collection(db, "services")));
});

test("ordinary authenticated users cannot write, read drafts, or grant themselves admin", async () => {
    for (const claims of [{}, { admin: false }, { admin: "true" }]) {
        const db = env.authenticatedContext("normal", claims).firestore();
        await assertFails(updateDoc(doc(db, "services", "active"), { name: "Modified", updatedAt: serverTimestamp() }));
        await assertFails(deleteDoc(doc(db, "blog", "published")));
        await assertFails(getDoc(doc(db, "blog", "draft")));
        await assertFails(setDoc(doc(db, "users", "normal"), { admin: true }));
        await assertFails(setDoc(doc(db, "content", "therapist"), { ...profile, updatedAt: serverTimestamp() }));
    }
});

test("administrators can create, edit, delete and read unpublished content", async () => {
    const db = env.authenticatedContext("admin", { admin: true }).firestore();
    await assertSucceeds(getDocs(collection(db, "blog")));
    await assertSucceeds(getDocs(collection(db, "services")));
    await assertSucceeds(setDoc(doc(db, "services", "new"), { ...service, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(db, "services", "new"), { name: "Editado", updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(db, "services", "new")));
    await assertSucceeds(setDoc(doc(db, "blog", "new"), { ...post, createdAt: serverTimestamp(), publishedAt: serverTimestamp(), updatedAt: serverTimestamp(), seoTitle: "SEO", seoDescription: "Descripción SEO" }));
    await assertSucceeds(updateDoc(doc(db, "blog", "new"), { title: "Editado", updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(db, "blog", "new")));
    await assertSucceeds(setDoc(doc(db, "categories", "new"), { ...category, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(db, "categories", "new"), { active: false, updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(db, "categories", "new")));
    await assertSucceeds(setDoc(doc(db, "content", "therapist"), { ...profile, updatedAt: serverTimestamp() }));
    await assertSucceeds(setDoc(doc(db, "blogSlugs", "entrada"), { postId: "published" }));
    await assertSucceeds(setDoc(doc(db, "blogSlugs", "entrada"), { postId: "published" }));
    await assertFails(setDoc(doc(db, "blogSlugs", "entrada"), { postId: "another-post" }));
});

test("invalid content and oversized SEO are rejected even for admins", async () => {
    const db = env.authenticatedContext("admin", { admin: true }).firestore();
    await assertFails(updateDoc(doc(db, "services", "active"), { duration: -1, updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "blog", "published"), { seoTitle: "a".repeat(71), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "blog", "published"), { seoDescription: "a".repeat(161), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "blog", "published"), { slug: "../private", updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "blog", "published"), { media: Array(11).fill({}), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "services", "active"), { name: "", updatedAt: serverTimestamp() }));
});

test("creation and publication timestamps cannot be rewritten", async () => {
    const db = env.authenticatedContext("admin", { admin: true }).firestore();
    await assertFails(updateDoc(doc(db, "blog", "published"), { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "blog", "published"), { publishedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, "blog", "published"), { title: "No timestamp", updatedAt: date }));
});

test("internal collections are inaccessible to all browser users", async () => {
    for (const db of [env.unauthenticatedContext().firestore(), env.authenticatedContext("admin", { admin: true }).firestore()]) {
        await assertFails(getDoc(doc(db, "_adminRateLimits", "key")));
        await assertFails(setDoc(doc(db, "_adminRateLimits", "key"), { count: 0 }));
        await assertFails(getDoc(doc(db, "content", "private")));
    }
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "content", "therapist")));
    await assertSucceeds(getDocs(collection(db, "categories")));
});
