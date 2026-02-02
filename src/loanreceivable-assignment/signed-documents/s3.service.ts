import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly bucket = process.env.AWS_S3_BUCKET;

  // DEV: inline credentials — remove for production
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

   // 🔹 UPLOAD
  async uploadFile(file: Express.Multer.File, key: string) {
    console.log({
      AWS_REGION: process.env.AWS_REGION,
      AWS_BUCKET: process.env.AWS_S3_BUCKET,
      AWS_KEY_LOADED: !!process.env.AWS_ACCESS_KEY_ID,
    });
    return this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
      }),
    );
  }
  
  async getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    try {
      const cmd = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3, cmd, { expiresIn: expiresInSeconds });
    } catch (err) {
      console.error('S3 signed URL error:', err);
      throw new InternalServerErrorException('Failed to create signed URL');
    }
  }
}






