import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import type { Multer } from 'multer'; // ✅ FIXED TYPE

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',

  // ✅ ONLY include credentials if NOT using IAM role
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export async function uploadToS3(
  file: Multer.File, // ✅ FIXED TYPE
): Promise<string> {
  if (!file) {
    throw new Error('File is required');
  }

  const key = `uploads/${uuid()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'nittan-nova-storage-public',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    }),
  );

  return key; // stored in DB as FilePath
}
