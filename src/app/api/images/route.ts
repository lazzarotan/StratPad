import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ImageStorageAdapter, getImageStorageAdapter } from "./ImageStorage";

import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, SAVE_IMAGE_AS_TYPE } from "./ImageStorage";

interface POSTResponse{
    success: boolean;
    imageAssetId: string | null;
    error: string | null;
}

export async function POST(req: Request): Promise<NextResponse<POSTResponse>> {

    //Validate session
    //IF NOT LOGGED IN, BLOCK THE UPLOAD.
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: "Must be logged in to upload images." }, { status: 401 });
    }
    //Get ownerId
    const ownerId = session.user.id;

    //Get the image file from the form data
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if(!(file instanceof File)){
        return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: "Missing image file." }, { status: 400 });
    }

    if(file.size <= 0){
        return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: "Image file is empty." }, { status: 400 });
    }

    //If file size is greater than 10MB, show error.
    if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: `Please upload an image smaller than ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }, { status: 400 });
    }

    //Use NPM package "file-type" to detect the ACTUAL file type, not just extension.
    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedFileType = await fileTypeFromBuffer(buffer);
    const mimeType = detectedFileType?.mime ?? "";

    //If file extension is not .jpg, .jpeg, or .png, show error.
    if (!ALLOWED_IMAGE_TYPES.has(detectedFileType?.mime ?? "")) {
        return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: `Unsupported file type: ${mimeType} || unknown` }, { status: 400 });
    }

    ////////////////////////////////////
   //Convert image and save to storage
    try{
        //Limit Pixels to avoid malicious "Pixel Bomb" attacks.
            //Also rotate image - something about "EXIF", where cell phones store images in a different orientation..
        const base = sharp(buffer, {limitInputPixels: 40_000_000}).rotate();


        //Convert and compress image to WebP format.
        const sharpImage = sharp(buffer);
        const compressedImage = await sharpImage.toFormat(SAVE_IMAGE_AS_TYPE, { quality: 82 }).toBuffer();

        //Generate UUID to act as storage key.
        const storageKey = `${randomUUID()}.${SAVE_IMAGE_AS_TYPE}`;


        //Save to storage - either local or cloud, based on .ENV configuration
        const storageAdapter: ImageStorageAdapter = getImageStorageAdapter();
        const result = await storageAdapter.saveImage(compressedImage, storageKey);
        if(!result.success){
            console.error("Failed to save image:", result.error);
            return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: "Failed to save image." }, { status: 500 });
        }

        //Create ImageAsset row via Prisma
        const imageAsset = await prisma.imageAsset.create({
            data: {
                storageKey: storageKey,
                byteSize: compressedImage.length,
                width: (await base.metadata()).width,
                height: (await base.metadata()).height,
                ownerId: ownerId,   
            }
        });

    return NextResponse.json<POSTResponse>({ success: true, imageAssetId: imageAsset.imageAssetId, error: null }, { status: 200 });
    }
    catch(error){
        console.error("Error saving image:", error);
        return NextResponse.json<POSTResponse>({ success: false, imageAssetId: null, error: "Failed to save image." }, { status: 500 });
    }
}