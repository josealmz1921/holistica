export const uploadImage = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Error uploading image");
    }

    return response.json();
};

export async function uploadBlogMedia(file: File) {
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, { method: "POST", body });
    if (!response.ok) throw new Error("No se pudo subir el archivo.");
    const result = await response.json();
    if (!result.secure_url || !result.public_id) throw new Error("Respuesta de subida no válida.");
    return { url: result.secure_url as string, publicId: result.public_id as string, resourceType: resourceType as "image" | "video", name: file.name };
}
