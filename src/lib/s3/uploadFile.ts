import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "./s3.js";

export const uploadFile = async (file: Uint8Array, fileName: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || "",
    Key: fileName,
    Body: file,
    ContentType: "application/pdf",
  });

  try {
    await S3.send(command);
  } catch (err) {
    console.log("Error", err);
  }
};
