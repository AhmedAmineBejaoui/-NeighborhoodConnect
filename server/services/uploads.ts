import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { randomUUID } from 'crypto';
import path from 'path';

export class UploadService {
  private static s3Client: S3Client;

  static getS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY,
          secretAccessKey: env.S3_SECRET_KEY,
        },
      });
    }
    return this.s3Client;
  }

  static async generatePresignedUrl(
    filename: string,
    contentType: string,
    userId: string
  ): Promise<{ url: string; key: string; fields?: Record<string, string> }> {
    const fileExtension = path.extname(filename);
    const key = `uploads/${userId}/${randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: 5 * 1024 * 1024, // 5MB max
    });

    const url = await getSignedUrl(this.getS3Client(), command, { 
      expiresIn: 300 // 5 minutes
    });

    return {
      url,
      key,
    };
  }

  static validateFileType(contentType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    
    return allowedTypes.includes(contentType);
  }

  static validateFileSize(size: number): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return size <= maxSize;
  }

  static getPublicUrl(key: string): string {
    if (env.S3_ENDPOINT) {
      return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`;
    }
    return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
  }
}
