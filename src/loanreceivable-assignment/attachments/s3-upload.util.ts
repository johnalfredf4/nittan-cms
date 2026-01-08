import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import type { Express } from 'express';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  file: Express.Multer.File,
): Promise<string> {
  const key = `uploads/${uuid()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: 'nittan-nova-storage-public',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    }),
  );

  return key; // ✅ this is FilePath
}
