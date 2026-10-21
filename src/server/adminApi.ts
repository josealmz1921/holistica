import "server-only";
import { adminAuth } from "./firebaseAdmin";

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

// Local to this module/process: resets on restart and is not shared between instances.
const requestCounters = new Map<string, { expiresAt: number; count: number }>();

export async function limitAdminRequests(uid: string, action: string, limit = 20) {
    const now = Date.now();
    for (const [key, counter] of requestCounters) {
        if (counter.expiresAt <= now) requestCounters.delete(key);
    }
    const key = JSON.stringify([uid, action]);
    const counter = requestCounters.get(key);
    if (counter) {
        if (counter.count >= limit) throw new ApiError(429, "Demasiadas solicitudes. Espera un minuto.");
        counter.count++;
    } else {
        // Bound memory without evicting active counters and bypassing their limits.
        if (requestCounters.size >= 10000) throw new ApiError(503, "Servicio temporalmente no disponible. Intenta más tarde.");
        requestCounters.set(key, { expiresAt: now + 60000, count: 1 });
    }
}

export function apiResponse(body: unknown, status = 200) {
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

type ApiErrorContext = {
    operation: "cloudinary-sign";
    stage: "authentication" | "rate-limit" | "request" | "configuration" | "signing";
};

export function apiError(error: unknown, context?: ApiErrorContext) {
    if (error instanceof ApiError) return apiResponse({ error: error.message }, error.status);
    const rawCode = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    const code = typeof rawCode === "number" && Number.isInteger(rawCode) && rawCode >= 0 && rawCode <= 16
        ? rawCode
        : typeof rawCode === "string" && /^(auth|app|firestore)\/[a-z-]{1,60}$/.test(rawCode) ? rawCode : undefined;
    // Log only controlled stages and recognized status codes, never messages, tokens or credentials.
    console.error("Admin API failed:", {
        ...context,
        type: error instanceof Error ? "Error" : "UnknownError",
        ...(code !== undefined ? { code } : {}),
    });
    return apiResponse({ error: "La operación no está disponible. Revisa la configuración del servidor." }, 503);
}
