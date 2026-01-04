import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

const s3 = new S3Client({
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: 'AKIA2W6HW6PIFDZGHYMA',
    secretAccessKey: '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',
  },
});

export async function uploadToS3(
  file: Express.Multer.File,
): Promise<string> {
  const key = `uploads/${uuid()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: 'nittan-nova-storage',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    }),
  );

  return key; // ✅ this is FilePath
}
