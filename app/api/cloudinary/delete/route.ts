import { NextResponse } from "next/server";
import cloudinary from "@/src/cloudinary/cloudinary";

export async function DELETE(request: Request) {
    try {
        const { publicId } = await request.json();

        const result = await cloudinary.uploader.destroy(
            publicId,
            {
                invalidate: true
            }
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error deleting image" },
            { status: 500 }
        );
    }
}