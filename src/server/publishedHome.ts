import 'server-only';
import { cache } from 'react';
import { adminDb } from './firebaseAdmin';
import { validatePageDocument } from '../page-builder/editor';
import { pageHomeErrors } from '../utilities/pageBuilder';

/** Public read of one fixed published document. Never reads drafts or accepts a path. */
export const getPublishedHome = cache(async () => {
    if (process.env.PAGE_BUILDER_HOME_DISABLED === 'true') return null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
        const snapshot = await Promise.race([
            adminDb().doc('pagePublished/home').get(),
            new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Published home timeout')), 4000); }),
        ]);
        if (!snapshot.exists) return null;
        const stored = snapshot.data();
        if (!Number.isSafeInteger(stored?.revision) || stored!.revision < 1) return null;
        const result = validatePageDocument(stored?.document, { mode: 'publish' });
        if (!result.success || result.data.id !== 'home' || pageHomeErrors(result.data).length || Buffer.byteLength(JSON.stringify(result.data), 'utf8') > 256 * 1024) {
            console.warn('Published home ignored: invalid snapshot');
            return null;
        }
        return result.data;
    } catch {
        // Do not expose/log provider messages, credentials or document content.
        console.warn('Published home unavailable; using original homepage');
        return null;
    } finally {
        if (timeout) clearTimeout(timeout);
    }
});
