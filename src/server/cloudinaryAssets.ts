import "server-only";
import { adminDb } from "./firebaseAdmin";
import { ApiError } from "./adminApi";

export function assetFolder() {
    const folder = process.env.CLOUDINARY_ASSET_FOLDER || "holistica";
    if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(folder)) throw new Error("Invalid Cloudinary asset folder");
    return folder;
}

export function validatePublicId(value: unknown): string {
    if (typeof value !== "string" || value.length > 255 || !/^[a-zA-Z0-9_./-]+$/.test(value) || value.split("/").some(part => !part || part === "." || part === "..")) {
        throw new ApiError(400, "Identificador de archivo no válido.");
    }
    return value;
}

export async function assertManagedImage(publicId: string) {
    if (publicId.startsWith(`${assetFolder()}/`)) return;
    // Keep existing pre-migration images editable, but never allow arbitrary account-wide deletion.
    const db = adminDb();
    const [services, blog, therapist] = await Promise.all([
        db.collection("services").get(), db.collection("blog").get(), db.doc("content/therapist").get(),
    ]);
    const known = services.docs.some(doc => (doc.data().gallery || []).some((image: { publicId?: string }) => image.publicId === publicId))
        || blog.docs.some(doc => (doc.data().media || []).some((media: { publicId?: string; resourceType?: string }) => media.publicId === publicId && media.resourceType === "image"))
        || therapist.data()?.photo?.publicId === publicId;
    if (!known) throw new ApiError(403, "El archivo no pertenece al contenido de este sitio.");
}
