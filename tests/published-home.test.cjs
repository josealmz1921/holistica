const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');

const page = () => ({ schemaVersion: 1, id: 'home', title: 'Inicio', seo: { title: 'Inicio publicado', description: 'Descripción publicada' }, sections: [{ id: 'portada', type: 'hero', variant: 'left', visible: true, content: { title: 'Título público', description: 'Bienestar', actions: [] } }] });

function setup(t, stored, error) {
    const previous = process.env.PAGE_BUILDER_HOME_DISABLED;
    delete process.env.PAGE_BUILDER_HOME_DISABLED;
    t.after(() => { if (previous === undefined) delete process.env.PAGE_BUILDER_HOME_DISABLED; else process.env.PAGE_BUILDER_HOME_DISABLED = previous; });
    const reads = [];
    const load = createLoader({
        'server-only': {},
        react: { cache: fn => fn },
        './firebaseAdmin': { adminDb: () => ({ doc: path => {
            reads.push(path);
            return { get: async () => { if (error === 'timeout') return new Promise(() => {}); if (error) throw error; return { exists: stored !== undefined, data: () => stored }; } };
        } }) },
    });
    return { ...load('src/server/publishedHome.ts'), reads };
}

test('public reader only reads the fixed published snapshot, not drafts or arbitrary paths', async t => {
    const stored = { document: page(), revision: 2 };
    const reader = setup(t, stored);
    assert.deepEqual(await reader.getPublishedHome(), stored.document);
    assert.deepEqual(reader.reads, ['pagePublished/home']);
});

test('missing publication and read errors fall back without leaking provider details', async t => {
    assert.equal(await setup(t).getPublishedHome(), null);
    const warnings = [];
    const original = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));
    t.after(() => { console.warn = original; });
    assert.equal(await setup(t, undefined, new Error('private provider information')).getPublishedHome(), null);
    assert.ok(warnings.length);
    assert.ok(!warnings.join(' ').includes('private provider information'));
});

test('rollback switch avoids Firestore entirely and preserves the stored publication', async t => {
    const stored = { document: page(), revision: 1 };
    const reader = setup(t, stored);
    process.env.PAGE_BUILDER_HOME_DISABLED = 'true';
    assert.equal(await reader.getPublishedHome(), null);
    assert.deepEqual(reader.reads, []);
    assert.equal(stored.document.sections[0].content.title, 'Título público');
});

test('slow publication reads fall back after four seconds rather than blocking the homepage', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const reader = setup(t, undefined, 'timeout');
    const pending = reader.getPublishedHome();
    t.mock.timers.tick(4000);
    assert.equal(await pending, null);
    assert.deepEqual(reader.reads, ['pagePublished/home']);
});

test('invalid published snapshots, unsafe images and host anchor collisions fall back', async t => {
    const original = console.warn;
    console.warn = () => {};
    t.after(() => { console.warn = original; });
    for (const change of [
        p => { p.id = 'other'; }, p => { p.schemaVersion = 2; }, p => { p.sections = []; },
        p => { p.sections[0].content.actions = [{ label: 'Bad', href: 'javascript:alert(1)' }]; },
        p => { p.sections[0].content.image = { src: 'https://untrusted.example/image.jpg', alt: '' }; },
        p => { p.sections[0].id = 'servicios'; },
    ]) {
        const invalid = page(); change(invalid);
        assert.equal(await setup(t, { document: invalid, revision: 1 }).getPublishedHome(), null);
    }
    for (const revision of [0, -1, '1', undefined]) assert.equal(await setup(t, { document: page(), revision }).getPublishedHome(), null);
});
