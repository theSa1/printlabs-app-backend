import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "./s3";

export const getDownloadUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || "",
    Key: key,
  });

  const url = await getSignedUrl(S3, command, {
    expiresIn: 60 * 60,
  });

  return url;
};
