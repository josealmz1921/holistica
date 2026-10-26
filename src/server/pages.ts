import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";
import { ApiError, apiError, apiResponse, limitAdminRequests, readJson, requireAdmin } from "./adminApi";
import { validatePageDocument } from "../page-builder/editor";
import { pageHomeErrors } from "../utilities/pageBuilder";

// Below Firestore's 1 MiB limit, including document envelope and field overhead.
export const PAGE_MAX_BYTES = 256 * 1024;

export function validateStoredPage(input: unknown, mode: "draft" | "publish") {
    const result = validatePageDocument(input, { mode });
    if (!result.success) throw new ApiError(400, result.issues.map(issue => `${issue.path}: ${issue.message}`).join("; ").slice(0, 2000));
    if (result.data.id !== "home") throw new ApiError(400, "Esta primera versión solo admite la página de inicio (home).");
    const imageErrors = pageHomeErrors(result.data);
    if (imageErrors.length) throw new ApiError(400, imageErrors.join(" "));
    if (Buffer.byteLength(JSON.stringify(result.data), "utf8") > PAGE_MAX_BYTES) throw new ApiError(413, "La página excede 256 KiB.");
    return result.data;
}

export async function getPageDraft(request: Request) {
    try {
        await requireAdmin(request);
        const db = adminDb();
        const [draft, published] = await Promise.all([db.doc("pageDrafts/home").get(), db.doc("pagePublished/home").get()]);
        return apiResponse({ document: draft.data()?.document ?? null, revision: draft.data()?.revision ?? 0, publishedRevision: published.data()?.revision ?? null });
    } catch (error) { return apiError(error); }
}

export async function writePage(request: Request, action: "save" | "publish") {
    try {
        const user = await requireAdmin(request);
        await limitAdminRequests(user.uid, `page-${action}`);
        const body = await readJson(request, PAGE_MAX_BYTES + 4096);
        const allowed = action === "save" ? ["document", "revision"] : ["revision"];
        if (Object.keys(body).some(key => !allowed.includes(key)) || !Number.isSafeInteger(body.revision) || (body.revision as number) < 0) throw new ApiError(400, "Solicitud o revisión no válida.");
        const document = action === "save" ? validateStoredPage(body.document, "draft") : null;
        const db = adminDb();
        const draftRef = db.doc("pageDrafts/home");
        const revision = await db.runTransaction(async transaction => {
            const current = await transaction.get(draftRef);
            const previous = current.data();
            if ((previous?.revision ?? 0) !== body.revision) throw new ApiError(409, "Otra sesión cambió el borrador. Recarga antes de continuar.");
            if (action === "save") {
                const next = (body.revision as number) + 1;
                transaction.set(draftRef, { document, revision: next, updatedAt: FieldValue.serverTimestamp() });
                return next;
            }
            if (!current.exists) throw new ApiError(400, "Guarda primero un borrador.");
            // Publish only the saved draft, never trust a client-supplied published document.
            const published = validateStoredPage(previous?.document, "publish");
            transaction.set(db.doc("pagePublished/home"), { document: published, revision: previous!.revision, publishedAt: FieldValue.serverTimestamp() });
            return previous!.revision as number;
        });
        return apiResponse({ revision });
    } catch (error) { return apiError(error); }
}
