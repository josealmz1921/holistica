const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const createLoader = require('./load-ts.cjs');

test('builder confirmations use SweetAlert2 with explicit confirmation and safe Spanish defaults', async () => {
    const calls = [];
    let result = { isConfirmed: false, isDismissed: true };
    const load = createLoader({
        sweetalert2: { fire: async options => { calls.push(options); return result; } },
        './builder.module.css': {},
    });
    const { confirmBuilderAction } = load('src/components/PageBuilder/confirmAction.ts');
    for (const action of ['load', 'remove', 'publish']) {
        assert.equal(await confirmBuilderAction(action), false);
        const options = calls.at(-1);
        assert.equal(options.showCancelButton, true);
        assert.equal(options.focusCancel, true);
        assert.equal(options.cancelButtonText, 'Cancelar');
        assert.equal(options.buttonsStyling, false);
        assert.equal(options.html, undefined);
        assert.ok(options.text.length > 0);
        assert.ok(options.confirmButtonText.length > 0);
    }
    result = { isConfirmed: true };
    assert.equal(await confirmBuilderAction('publish'), true);
    result = { isConfirmed: false, isDenied: true };
    assert.equal(await confirmBuilderAction('remove'), false);
});

test('builder has no native confirmation dialogs, but retains browser protection on unload', () => {
    const editor = fs.readFileSync('src/components/PageBuilder/pageEditor.tsx', 'utf8');
    assert.doesNotMatch(editor, /window\.(?:confirm|alert|prompt)\(/);
    assert.match(editor, /beforeunload/);
    assert.match(editor, /confirmationPending\.current/);
});
