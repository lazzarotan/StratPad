//File: /images/[imageAssetId]/route.js
//Author: Josh Rice
/*
    ENDPOINTS:
        GET /api/images/[imageAssetId]
            - User must either OWN the image, or the image be part of a publicly accessible dashboard.
        
            Returns:
            {error: string || undefined} {status: 200 || 400 || 401 || 403 || 404 || 500}

        DELETE /api/images/[imageAssetId]
            Body: none
        
            - User must OWN the image.
            Returns:
            {success: boolean, message: string || undefined} {status: 200 || 400 || 401 || 404 || 500}
*/


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getImageStorageAdapter } from "../ImageStorage";


interface GETResponse{
    success: boolean;
    imageAssetId: string | null;
    error: string | null;
}

export async function GET(request: Request, { params }: { params: Promise<{ imageAssetId: string }> }): Promise<NextResponse<GETResponse>> {

    const { imageAssetId } = await params;

    const parsedImageAssetId = parseInt(imageAssetId);
    console.log("ImageAssetId: ", parsedImageAssetId);
    if(isNaN(parsedImageAssetId)){
        return NextResponse.json<GETResponse>({ success: false, imageAssetId: null, error: "Invalid image asset id" }, { status: 400 });
    }


    //Ensure image exists
    const imageAsset = await prisma.imageAsset.findUnique({
        where: {
            imageAssetId: parsedImageAssetId,
        },
    });
    if (!imageAsset) {
        return NextResponse.json<GETResponse>({ success: false, imageAssetId: null, error: "Image not found" }, { status: 404 });
    }



    /////////////////////////////  
    //Return the image.
      
    try{
        const imageStorage = getImageStorageAdapter();
        const loadResult = await imageStorage.loadImage(imageAsset.storageKey);
        if(!loadResult.success || !loadResult.image){
            console.error("Failed to load image from storage: ", loadResult.error);
            return NextResponse.json<GETResponse>({ success: false, imageAssetId: null, error: "Failed to load image."}, {status: 500});
        }


        return new NextResponse(Buffer.from(loadResult.image), { headers: { "Content-Type": "image/webp" } });
    }
    catch(error){
        console.error("Error loading image: ", error);
        return NextResponse.json<GETResponse>({ success: false, imageAssetId: null, error: "Failed to load image." }, { status: 500 });
    }
}


interface DELETEResponse{
    success: boolean;
    message: string | null;
    error: string | null;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ imageAssetId: string }> }): Promise<NextResponse<DELETEResponse>> {
    const { imageAssetId } = await params;
    
    const parsedImageAssetId = parseInt(imageAssetId);
    
    //Validate session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        console.log("Unauthorized image delete attempt");
        return NextResponse.json<DELETEResponse>({ success: false, message: null, error: "Unauthorized" }, { status: 401 });
    }


    try{
        //Image must:
            //1. Exist
            //2. Be owned by the caller
        const imageAsset = await prisma.imageAsset.findUnique({
            where: {
                imageAssetId: parsedImageAssetId,
                ownerId: session.user.id,
            },
        });
        if (!imageAsset) {
            return NextResponse.json<DELETEResponse>({ success: false, message: null, error: "Image not found" }, { status: 404 });
        }

        //Delete ImageAsset row from DB.
            //Worst case Ontario, we have some orphaned file in storage.
        await prisma.imageAsset.delete({
            where: {
                imageAssetId: parsedImageAssetId,
            },
        });

        //Delete image from storage (local or cloud)
        const imageStorage = getImageStorageAdapter();
        const deleteResult = await imageStorage.deleteImage(imageAsset.storageKey);

        return NextResponse.json<DELETEResponse>({ success: true, message: "Image deleted successfully", error: null }, { status: 200 });
    }
    catch(error){
        console.error("Error validating image ownership or deleting: ", error);
        return NextResponse.json<DELETEResponse>({ success: false, message: null, error: "Internal server error" }, { status: 500 });
    }
}