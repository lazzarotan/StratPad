//File: ImageStorage.ts
//Author: Josh Rice
/*Description:
    Exports ImageStorageAdapter & getImageStorageAdapter.

    Abstracts away cloud vs local storage for:
        saveImage()
        deleteImage()
        loadImage()

    //NOTE: If no .env variables are set, it just defaults to local disk.
        //I.e. most group members don't need to know/worry about setting their .env

    //Required .env variables for R2:
        //R2_ACCOUNT_ID
        //R2_ACCESS_KEY_ID
        //R2_SECRET_ACCESS_KEY
        //R2_BUCKET_NAME

    EXAMPLE USAGE:
        import { ImageStorageAdapter, getImageStorageAdapter } from "./ImageStorage";
    
        const imageStorage: ImageStorageAdapter = getImageStorageAdapter();

        imageStorage.saveImage(imageBuffer, storageKey);
*/


import fs from "fs";
import path from "path";
import sharp from "sharp";//Only used for the exported constants below.
import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'


const LOCAL_DEV_STORAGE_PATH = path.join(process.cwd(), "dev_img_uploads");


//NOTE: These constants are only used in the endpoints.
//I'm just keeping them here so that all "magic stuff" is in one place.
export const MAX_IMAGE_SIZE: number = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Set<string> = new Set(["image/jpeg", "image/png", "image/webp"]);
export const SAVE_IMAGE_AS_TYPE: keyof sharp.FormatEnum = "webp";

//Mime type for the image we're saving. Used in R2 to set Content-type header
const SAVE_IMAGE_MIME_TYPE: string = "image/webp";


//These are the functions available for image storage.
export interface ImageStorageAdapter{
        saveImage(image: Buffer, storageKey: string): Promise<{success: boolean, error?: string}>;
        deleteImage(storageKey: string): Promise<{success: boolean, error?: string}>;
        loadImage(storageKey: string): Promise<{success: boolean, image?: Buffer, error?: string}>;
}




//Just default to local. Most other group members don't need to know/worry about this.
//This way, we just store to their dev machines if in doubt.
export function getImageStorageAdapter(): ImageStorageAdapter{
    if(process.env.IMAGE_ADAPTER === "cloud"){
        return new CloudFlareR2ImageStorageAdapter();
    } else{
        return new LocalDiskImageStorageAdapter();
    }
}

////////////////////////////////////////////
//Local Disk Implementation

class LocalDiskImageStorageAdapter implements ImageStorageAdapter{
    async saveImage(image: Buffer, storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const storagePath = path.join(LOCAL_DEV_STORAGE_PATH, storageKey);
            await fs.promises.writeFile(storagePath, image);
            return { success: true };
        } catch (error) {
            return { success: false, error: "Failed to save image locally." };
        }
    }

    async deleteImage (storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const storagePath = path.join(LOCAL_DEV_STORAGE_PATH, storageKey);
            await fs.promises.unlink(storagePath);
            return { success: true };
        }
        catch (error){
            return { success: false, error: "Failed to delete image locally." };
        }
    }

    async loadImage(storageKey: string): Promise<{success: boolean, image?: Buffer, error?: string}>{
        try{
            const storagePath = path.join(LOCAL_DEV_STORAGE_PATH, storageKey);
            const image = await fs.promises.readFile(storagePath);
            return { success: true, image, };
        }
        catch (error){
            return { success: false, error: "Failed to load image locally." };
        }
    }
}

///////////////////////////////////////////
//Cloudflare R2 Implementation

//helper function to get the R2 client
function getR2Client(): S3Client{
    return new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
    });
}
const BUCKET = process.env.R2_BUCKET_NAME!;

class CloudFlareR2ImageStorageAdapter implements ImageStorageAdapter{   
    async saveImage(image: Buffer, storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const client = getR2Client();
            await client.send(
                new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: storageKey,
                    Body: image,
                    ContentType: SAVE_IMAGE_MIME_TYPE,
                })
            )
            return { success: true };
        }
        catch (error){
            console.error("Failed to save image to R2: ", error);
            return { success: false, error: "Failed to save image to R2." };
        }
    }
    async deleteImage (storageKey: string): Promise<{success: boolean, error?: string}>{
        try{
            const client = getR2Client();
            await client.send(
                new DeleteObjectCommand({
                    Bucket: BUCKET,
                    Key: storageKey,
                })
            );
            return { success: true };
        }
        catch (error){
            console.error("Failed to delete image from R2: ", error);
            return { success: false, error: "Failed to delete image from R2." };
        }
    }
    async loadImage(storageKey: string): Promise<{success: boolean, image?: Buffer, error?: string}>{
        try{
            const client = getR2Client();

            const response = await client.send(
                new GetObjectCommand({
                    Bucket: BUCKET,
                    Key: storageKey,
                })
            );

            //It's expecting a buffer, same as local.
            const chunks: Uint8Array[] = [];
            for await (const chunk of response.Body as AsyncIterable<Uint8Array>){
                chunks.push(chunk);
            }

            return{ success: true, image: Buffer.concat(chunks) };
        }
        catch (error){
            console.error("Failed to load image from R2: ", error);
            return { success: false, error: "Failed to load image from R2." };
        }
    }
}


