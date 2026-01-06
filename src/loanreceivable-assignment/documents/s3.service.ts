import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly bucket = 'nittan-nova-storage';

  // DEV: inline credentials — remove for production
  private readonly s3 = new S3Client({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: 'AKIA2W6HW6PIFDZGHYMA',
      secretAccessKey: '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',
    },
  });

  async uploadFile(file: Express.Multer.File, key: string): Promise<void> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'private',
        }),
      );
    } catch (err) {
      console.error('S3 upload error:', err);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
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
