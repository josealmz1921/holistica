import { adminHeaders } from "@/src/firebase/adminRequest";

export const deleteImage = async (
    publicId: string
) => {

    const response = await fetch(
        "/api/cloudinary/delete",
        {
            method: "DELETE",
            headers: await adminHeaders(),
            body: JSON.stringify({
                publicId
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            "Error deleting image"
        );
    }

    return response.json();
};
