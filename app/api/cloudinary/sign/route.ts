import { randomUUID } from "node:crypto";
import cloudinary from "@/src/cloudinary/cloudinary";
import { apiError, apiResponse, requireAdmin, readJson, limitAdminRequests, ApiError } from "@/src/server/adminApi";
import { assetFolder } from "@/src/server/cloudinaryAssets";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const user = await requireAdmin(request);
        await limitAdminRequests(user.uid, "upload");
        const { resourceType } = await readJson(request);
        if (resourceType !== "image" && resourceType !== "video") throw new ApiError(400, "Tipo de archivo no permitido.");
        const uploadPreset = resourceType === "image" ? process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET : process.env.CLOUDINARY_VIDEO_UPLOAD_PRESET;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!uploadPreset || !apiSecret || !apiKey || !cloudName) throw new Error("Cloudinary signed uploads are not configured");
        const params = {
            timestamp: Math.floor(Date.now() / 1000),
            folder: assetFolder(), public_id: randomUUID(), overwrite: false,
            upload_preset: uploadPreset,
            allowed_formats: resourceType === "image" ? "jpg,png" : "mp4,webm",
        };
        const signature = cloudinary.utils.api_sign_request(params, apiSecret);
        return apiResponse({ params, signature, apiKey, cloudName, resourceType });
    } catch (error) { return apiError(error); }
}
