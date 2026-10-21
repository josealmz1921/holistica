import { adminHeaders } from "@/src/firebase/adminRequest";
import type { BlogMedia } from "@/src/firebase/blog";

async function upload(file: File, resourceType: "image" | "video") {
    const validTypes = resourceType === "image" ? ["image/jpeg", "image/png"] : ["video/mp4", "video/webm"];
    const maxSize = (resourceType === "image" ? 5 : 150) * 1024 * 1024;
    if (!validTypes.includes(file.type) || file.size > maxSize) throw new Error("Formato o tamaño de archivo no permitido.");
    const response = await fetch("/api/cloudinary/sign", {
        method: "POST", headers: await adminHeaders(), body: JSON.stringify({ resourceType }),
    });
    if (!response.ok) {
        let message = "No se pudo autorizar la subida. Verifica tu sesión y la configuración del servidor.";
        try {
            const body = await response.json();
            if (typeof body?.error === "string" && body.error.length <= 300) message = body.error;
        } catch { /* An upstream failure may return HTML instead of the API's JSON error. */ }
        throw new Error(`${message} (HTTP ${response.status})`);
    }
    const { params, signature, apiKey, cloudName } = await response.json();
    const body = new FormData();
    body.append("file", file);
    for (const [key, value] of Object.entries(params)) body.append(key, String(value));
    body.append("signature", signature);
    body.append("api_key", apiKey);
    const uploaded = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`, { method: "POST", body });
    if (!uploaded.ok) throw new Error("No se pudo subir el archivo. Revisa los límites del preset de Cloudinary.");
    const result = await uploaded.json();
    if (!result.secure_url || !result.public_id) throw new Error("Respuesta de subida no válida.");
    return result;
}

export const uploadImage = (file: File) => upload(file, "image");

export async function uploadBlogMedia(file: File): Promise<BlogMedia> {
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const result = await upload(file, resourceType);
    return { url: result.secure_url as string, publicId: result.public_id as string, resourceType, name: file.name };
}
