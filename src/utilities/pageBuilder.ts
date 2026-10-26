import type { PageDocument } from "../page-builder/editor";

export const PREVIEW_KEY = "flor-de-luna:page-builder-preview:v1";

// Matches next.config.ts without expanding the allowed remote image origins.
export function pageImageErrors(document: PageDocument): string[] {
    const errors: string[] = [];
    function visit(value: unknown) {
        if (!value || typeof value !== "object") return;
        if ("src" in value && typeof value.src === "string") {
            let allowed = /^\/img\/[\w./-]+$/.test(value.src) && !value.src.includes("..");
            try {
                const url = new URL(value.src);
                const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                allowed = Boolean(cloud) && url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.startsWith(`/${cloud}/`);
            } catch { /* Local paths are handled above. */ }
            if (!allowed) errors.push("Usa imágenes locales de /img/ o del Cloudinary configurado para este sitio.");
        }
        for (const child of Object.values(value)) visit(child);
    }
    visit(document);
    return [...new Set(errors)];
}
