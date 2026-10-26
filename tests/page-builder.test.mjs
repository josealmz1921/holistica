import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Compile local TS in memory; no generated files, new runner or global require hooks.
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (file.endsWith('.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
  if (cache.has(file)) return cache.get(file).exports;
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const compiledModule = { exports: {} };
  cache.set(file, compiledModule);
  const localRequire = (name) => {
    if (!name.startsWith('.')) return require(name);
    const target = path.resolve(path.dirname(file), name);
    const resolved = [target, `${target}.ts`, `${target}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!resolved) throw new Error(`Cannot resolve ${name}`);
    return load(resolved);
  };
  new vm.Script(`(function(module, exports, require) { ${compiled}\n})`, { filename: file })
    .runInThisContext()(compiledModule, compiledModule.exports, localRequire);
  return compiledModule.exports;
}

const { examplePage } = load('src/page-builder/examples/page.ts');
const { validatePageDocument, parsePageDocument, isSafeUrl } = load('src/page-builder/schemas/page.schema.ts');
const { createBlock } = load('src/page-builder/registry/create-block.ts');
const { blockRegistry } = load('src/page-builder/registry/blocks.ts');
const { getBlockFields } = load('src/page-builder/registry/fields.ts');
const { default: PageRenderer } = load('src/page-builder/renderer/PageRenderer.tsx');
const { florDeLunaTheme } = load('src/page-builder/styles/themes.ts');
const copy = () => structuredClone(examplePage);

test('editor insertion and duplication retain variants and keep additional heroes hidden', () => {
  const { insertBlock, duplicateBlock } = load('src/components/PageBuilder/editorOperations.ts');
  const page = copy();
  const inserted = insertBlock(page, 'hero', 1, 'new-hero');
  assert.equal(inserted.sections[1].id, 'new-hero');
  assert.equal(inserted.sections[1].visible, false);
  assert.equal(page.sections.length + 1, inserted.sections.length);
  assert.equal(page.sections.some(section => section.id === 'new-hero'), false);
  const duplicated = duplicateBlock(page, 0, 'copied-hero');
  assert.equal(duplicated.sections[1].variant, page.sections[0].variant);
  assert.equal(duplicated.sections[1].visible, false);
  duplicated.sections[1].content.title = 'Independent copy';
  assert.notEqual(page.sections[0].content.title, 'Independent copy');
  assert.equal(insertBlock({ ...page, sections: Array(100).fill(page.sections[0]) }, 'text', 0, 'over-limit').sections.length, 100);
});

test('drag insertion gaps preserve all sections and support both directions and end position', () => {
  const { moveBlockToGap } = load('src/components/PageBuilder/editorOperations.ts');
  const sections = ['a', 'b', 'c', 'd'].map(id => ({ id }));
  const ids = result => result.map(section => section.id);
  assert.deepEqual(ids(moveBlockToGap(sections, 0, 4)), ['b', 'c', 'd', 'a']);
  assert.deepEqual(ids(moveBlockToGap(sections, 3, 0)), ['d', 'a', 'b', 'c']);
  assert.deepEqual(ids(moveBlockToGap(sections, 1, 3)), ['a', 'c', 'b', 'd']);
  assert.deepEqual(ids(moveBlockToGap(sections, 1, 2)), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids(sections), ['a', 'b', 'c', 'd']);
  assert.equal(moveBlockToGap(sections, -1, 0), sections);
});

test('inline edits are plain strings, immutable and restricted to registered content fields', () => {
  const { updateInlineText, inlineTextFields, isInlineField } = load('src/components/PageBuilder/inlineEditing.ts');
  const hero = createBlock('hero', 'inline-hero');
  const edited = updateInlineText(hero, 'content.title', '<script>not HTML</script>');
  assert.equal(edited.content.title, '<script>not HTML</script>');
  assert.notEqual(hero.content.title, edited.content.title);
  assert.equal(updateInlineText(hero, 'content.__proto__.polluted', 'no'), hero);
  assert.equal(updateInlineText(hero, 'id', 'changed'), hero);
  assert.equal(updateInlineText(hero, 'content.image.src', 'javascript:bad'), hero);
  assert.equal(updateInlineText(hero, 'content.title', 'x'.repeat(10001)), hero);
  const empty = updateInlineText(hero, 'content.title', '');
  const page = { ...copy(), sections: [empty] };
  assert.equal(validatePageDocument(page, { mode: 'draft' }).success, true);
  assert.equal(validatePageDocument(page, { mode: 'publish' }).success, false);
  assert.ok(inlineTextFields(hero).some(field => field.path === 'content.subtitle'));
  assert.equal(isInlineField({ name: 'alt', kind: 'text' }, 'cards'), false);
  assert.equal(isInlineField({ name: 'title', kind: 'text' }, 'cards'), true);
});

test('inline slots cover texts, buttons and card/project items without changing public output', () => {
  const { updateInlineText, inlineTextFields } = load('src/components/PageBuilder/inlineEditing.ts');
  for (const type of Object.keys(blockRegistry)) {
    const block = createBlock(type, `inline-${type}`);
    if (['hero', 'text', 'banner'].includes(type)) block.content.actions = [{ label: 'Call to action', href: '/contacto' }];
    if (type === 'cards' || type === 'projects') block.content.items = [{
      id: 'first-item', title: 'Card title', description: 'Card description', link: { text: 'Learn more', href: '/info' },
      ...(type === 'projects' ? { image: { src: '/img/example.jpg', alt: '' }, company: '', category: '' } : {}),
    }];
    const page = { ...copy(), sections: [block] };
    const paths = [];
    const html = renderToStaticMarkup(React.createElement(PageRenderer, {
      document: page, mode: 'draft', renderText: (id, path, value) => {
        assert.equal(id, block.id);
        assert.ok(inlineTextFields(block).some(field => field.path === path), `${type}: ${path}`);
        paths.push(path);
        return React.createElement('span', { 'data-inline-path': path }, value || 'placeholder');
      },
    }));
    assert.ok(paths.includes('content.title'));
    assert.match(html, /data-inline-path="content.title"/);
    const publicHtml = renderToStaticMarkup(React.createElement(PageRenderer, { document: page, mode: 'draft' }));
    assert.doesNotMatch(publicHtml, /data-inline-path|contenteditable|placeholder/);
    if (block.content.items?.length) {
      assert.ok(paths.includes('content.items.0.title'));
      assert.ok(paths.includes('content.items.0.description'));
      assert.ok(paths.includes('content.items.0.link.text'));
      if (type === 'projects') {
        assert.ok(paths.includes('content.items.0.company'));
        assert.ok(paths.includes('content.items.0.category'));
      }
      const next = updateInlineText(block, 'content.items.0.title', 'Updated card');
      assert.equal(next.content.items[0].title, 'Updated card');
      assert.notEqual(block.content.items[0].title, 'Updated card');
    }
    if (block.content.actions?.length) {
      assert.ok(paths.includes('content.actions.0.label'));
      assert.equal(updateInlineText(block, 'content.actions.0.label', 'New action').content.actions[0].label, 'New action');
    }
  }
});

test('Flor de luna starts from a valid themed home draft without replacing public routes', () => {
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  const { pageImageErrors } = load('src/utilities/pageBuilder.ts');
  const page = initialPage();
  assert.equal(page.id, 'home');
  assert.equal(page.schemaVersion, 1);
  assert.equal(validatePageDocument(page, { mode: 'publish' }).success, true);
  assert.deepEqual(pageImageErrors(page), []);
  const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: page, theme: florDeLunaTheme }));
  assert.match(html, /Masajes tántricos en Pachuca/);
  assert.match(html, /Estado de México/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(!fs.readFileSync('app/(site)/page.tsx', 'utf8').includes('PageRenderer'));
});

test('valid page round-trips as JSON and parsing omits undefined properties', () => {
  const page = copy(); page.sections[0].navigationLabel = undefined;
  const parsed = parsePageDocument(page);
  assert.deepEqual(JSON.parse(JSON.stringify(parsed)), parsed);
  assert.equal('navigationLabel' in parsed.sections[0], false);
});

test('unknown fields, versions, blocks and variants are rejected', () => {
  const changes = [
    (p) => { p.schemaVersion = 2; },
    (p) => { p.sections[0].type = '__proto__'; },
    (p) => { p.sections[1].variant = 'missing'; },
    (p) => { p.sections[0].content.html = '<script>alert(1)</script>'; },
    (p) => { p.sections[0].settings = { imageOpacity: 2 }; },
    (p) => { p.sections[1].columns = 9; },
  ];
  for (const change of changes) { const p = copy(); change(p); assert.equal(validatePageDocument(p).success, false); }
});

test('safe URLs allow local, HTTP(S), anchor, email and phone but reject executable URLs', () => {
  for (const url of ['/servicios', 'https://example.com', '#contacto', 'mailto:demo@example.com', 'tel:+521234567890']) assert.equal(isSafeUrl(url), true, url);
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,test', '//example.com', '/\\evil.com', 'https://user:password@example.com', 'mailto:test@example.com%0aBcc:bad@example.com']) assert.equal(isSafeUrl(url), false, url);
  assert.equal(isSafeUrl('mailto:demo@example.com', true), false);
  const p = copy(); p.sections[0].content.actions = [{ label: 'Ir', href: 'javascript:alert(1)' }];
  assert.equal(validatePageDocument(p).success, false);
});

test('publish requires a unique first H1; drafts may be empty', () => {
  const p = copy(); p.sections = [];
  assert.equal(validatePageDocument(p).success, false);
  assert.equal(validatePageDocument(p, { mode: 'draft' }).success, true);
  const duplicate = copy(); duplicate.sections.push({ ...duplicate.sections[0], id: 'otra-portada' });
  assert.equal(validatePageDocument(duplicate).success, false);
  const reordered = copy(); reordered.sections.reverse();
  assert.equal(validatePageDocument(reordered).success, false);
});

test('duplicate IDs, reserved anchors, oversized lists and incomplete items are rejected', () => {
  const changes = [
    (p) => { p.sections[1].id = p.sections[0].id; },
    (p) => { p.sections[1].id = 'contenido'; },
    (p) => { p.sections[1].content.items.push(p.sections[1].content.items[0]); },
    (p) => { p.sections[1].content.items[0].image = { src: '/picture.jpg' }; },
    (p) => { p.sections = Array(101).fill(p.sections[0]); },
  ];
  for (const change of changes) { const p = copy(); change(p); assert.equal(validatePageDocument(p).success, false); }
});

test('every block has editor fields and a valid draft factory', () => {
  for (const type of Object.keys(blockRegistry)) {
    const block = createBlock(type, `nuevo-${type}`);
    assert.deepEqual(getBlockFields(type).find((field) => field.name === 'variant').options, blockRegistry[type].variants);
    assert.equal(validatePageDocument({ ...copy(), sections: [block] }, { mode: 'draft' }).success, true, type);
  }
});

test('all variants render; hidden blocks disappear; content remains escaped', () => {
  for (const [type, config] of Object.entries(blockRegistry)) {
    for (const variant of config.variants) {
      const block = createBlock(type, `bloque-${type}`);
      block.variant = variant;
      block.content.description = 'Descripción de ejemplo';
      if (type === 'hero' || type === 'banner') block.content.image = { src: '/background.jpg', alt: '' };
      if (type === 'cards') block.content.items = [{ id: 'tarjeta', title: 'Tarjeta', description: 'Contenido', image: { src: '/card.jpg', alt: 'Imagen' } }];
      if (type === 'projects') {
        block.content.emptyMessage = 'Sin proyectos';
        block.content.items = [{ id: 'proyecto', title: 'Proyecto', description: 'Descripción', category: 'Web', company: 'Empresa', image: { src: '/demo.jpg', alt: 'Captura' }, logo: { src: '/logo.png', alt: 'Logo' }, link: { text: 'Visitar', href: 'https://example.com', target: '_blank' } }];
      }
      const sections = type === 'hero' ? [block] : [copy().sections[0], block];
      const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: { ...copy(), sections } }));
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.ok(html.includes(`id="bloque-${type}"`), `${type}/${variant}`);
    }
  }
  const p = copy(); p.sections[1].visible = false; p.sections[0].content.title = '<script>alert(1)</script>';
  const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: p, theme: florDeLunaTheme }));
  assert.ok(!html.includes('id="servicios"'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('--pb-background:var(--color-secondary, #f5f2ed)'));
});

test('portable module has no external aliases, brand content, env or Tailwind directives', () => {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (/\.(tsx?|css)$/.test(target)) {
        const text = fs.readFileSync(target, 'utf8');
        assert.ok(!/@apply|@\/|process\.env|Ingenix|\/img\//.test(text), target);
      }
    }
  }
  walk('src/page-builder');
});
