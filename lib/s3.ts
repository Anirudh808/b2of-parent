import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

// S3 Configuration initialized from environment variables
const s3Config = {
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
};

const bucketNameVal = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || "";

const hasAwsCredentials = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    bucketNameVal
);

// Global S3 client instance for performance and resource reuse
const s3Client = hasAwsCredentials ? new S3Client(s3Config) : null;

/**
 * Uploads a base64 encoded webcam image either to an AWS S3 bucket 
 * or falls back to storing it locally on the server file system.
 * 
 * @param base64Data The base64 encoded image string (data URI or raw base64)
 * @param filename The base filename for saving the file
 * @returns The resolved accessible URL (S3 bucket link or local public path)
 */
export async function uploadImage(base64Data: string, filename: string): Promise<string> {
    // --- BUFFER ABSTRACTION LOGIC ---
    // 1. We inspect the base64 string structure. Web browser canvas captures usually 
    //    return a Data URL scheme prefix (e.g. "data:image/jpeg;base64,...").
    // 2. We use regex to parse and extract:
    //    - The MIME type (e.g. "image/jpeg" or "image/png"), which specifies content metadata.
    //    - The actual base64 encoded payload, stripping the schema prefix.
    // 3. We convert this parsed ASCII base64 payload into a raw binary buffer using 
    //    `Buffer.from(payload, "base64")`. This buffer represents the raw image data 
    //    required for storage writes (both S3 payload and local file system streams).
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType: string;

    if (!matches || matches.length < 3) {
        // Fallback in case raw base64 data without prefix is received
        buffer = Buffer.from(base64Data, "base64");
        mimeType = "image/jpeg";
    } else {
        mimeType = matches[1];
        // Strip the data URL prefix and abstract the base64 string to a binary node Buffer
        buffer = Buffer.from(matches[2], "base64");
    }

    // Try AWS S3 Upload if credentials and bucket are configured
    if (hasAwsCredentials && s3Client) {
        try {
            const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || "";
            const cleanFilename = `${Date.now()}_${filename.replace(/\s+/g, "_")}`;
            const key = `b20f-parent/${cleanFilename}`;

            await s3Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: mimeType,
                })
            );

            // Return S3 URL
            return `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
        } catch (error) {
            console.error("AWS S3 upload failed. Falling back to local storage:", error);
            // Fall through to local storage fallback
        }
    }

    // Local Server Storage Fallback
    try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Ensure local upload directory path exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const cleanFilename = `${Date.now()}_${filename.replace(/\s+/g, "_")}`;
        const filePath = path.join(uploadDir, cleanFilename);
        
        // Write the abstracted binary buffer directly to the local server disk
        fs.writeFileSync(filePath, buffer);

        // Return relative public URL that Next.js static routing serves
        return `/uploads/${cleanFilename}`;
    } catch (fsError) {
        console.error("Local file system backup storage failed:", fsError);
        throw new Error("Unable to save photo evidence. Both S3 and local storage fallbacks failed.");
    }
}

/**
 * Generates a presigned URL for an S3 photoUrl.
 * If the URL is a local public URL, it returns the URL as is.
 * 
 * @param photoUrl The stored URL (either S3 or local)
 * @returns The presigned URL or the local URL
 */
export async function getPresignedUrl(photoUrl: string): Promise<string> {
    if (!photoUrl) return "";

    // If it's a local relative URL, return it as-is
    if (!photoUrl.startsWith("http://") && !photoUrl.startsWith("https://")) {
        return photoUrl;
    }

    if (!hasAwsCredentials || !s3Client) {
        return photoUrl;
    }

    try {
        const parsedUrl = new URL(photoUrl);
        // Check if it's an S3 URL
        if (parsedUrl.hostname.includes(".amazonaws.com")) {
            const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || "";
            // Strip leading slash
            const key = decodeURIComponent(parsedUrl.pathname.slice(1));

            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            // Presigned URL valid for 1 hour (3600 seconds)
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return signedUrl;
        }
    } catch (error) {
        console.error("Error generating presigned URL, falling back to original:", error);
    }

    return photoUrl;
}
