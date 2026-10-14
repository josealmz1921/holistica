import "server-only";
import { createHash } from "node:crypto";
import { adminAuth, adminDb } from "./firebaseAdmin";

export class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
}

export async function requireAdmin(request: Request) {
    const authorization = request.headers.get("authorization") || "";
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match || match[1].length > 8192) throw new ApiError(401, "Inicia sesión para continuar.");
    const auth = adminAuth();
    let token;
    try { token = await auth.verifyIdToken(match[1], true); }
    catch { throw new ApiError(401, "La sesión no es válida. Vuelve a iniciar sesión."); }
    if (token.admin !== true) throw new ApiError(403, "Esta operación requiere permisos de administrador.");
    return token;
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new ApiError(415, "Se requiere JSON.");
    const reader = request.body?.getReader();
    if (!reader) throw new ApiError(400, "Solicitud vacía.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16 * 1024) { await reader.cancel(); throw new ApiError(413, "Solicitud demasiado grande."); }
        chunks.push(value);
    }
    try {
        const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid object");
        return body as Record<string, unknown>;
    } catch { throw new ApiError(400, "JSON no válido."); }
}

// Persisted counters work across serverless instances; clients cannot access this collection.
export async function limitAdminRequests(uid: string, action: string, limit = 30) {
    const bucket = Math.floor(Date.now() / 60000);
    const key = createHash("sha256").update(`${uid}:${action}`).digest("hex");
    const db = adminDb();
    const ref = db.collection("_adminRateLimits").doc(key);
    await db.runTransaction(async transaction => {
        const snapshot = await transaction.get(ref);
        const previous = snapshot.data();
        const count = previous?.bucket === bucket ? Number(previous.count) : 0;
        if (count >= limit) throw new ApiError(429, "Demasiadas solicitudes. Espera un minuto.");
        transaction.set(ref, { bucket, count: count + 1 });
    });
}

export function apiResponse(body: unknown, status = 200) {
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiError(error: unknown) {
    if (error instanceof ApiError) return apiResponse({ error: error.message }, error.status);
    console.error("Admin API failed:", error instanceof Error ? error.name : "UnknownError");
    return apiResponse({ error: "La operación no está disponible. Revisa la configuración del servidor." }, 503);
}
