import cloudinary from "@/src/cloudinary/cloudinary";
import { apiError, apiResponse, requireAdmin, readJson, limitAdminRequests } from "@/src/server/adminApi";
import { assertManagedImage, validatePublicId } from "@/src/server/cloudinaryAssets";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
    try {
        const user = await requireAdmin(request);
        await limitAdminRequests(user.uid, "delete");
        const body = await readJson(request);
        const publicId = validatePublicId(body.publicId);
        await assertManagedImage(publicId);
        const result = await cloudinary.uploader.destroy(
            publicId,
            {
                invalidate: true
            }
        );

        return apiResponse({ result: result.result });
    } catch (error) { return apiError(error); }
}
