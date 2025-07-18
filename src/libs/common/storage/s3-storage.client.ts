import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

import { File, StorageClient, UploadFileResponse } from '~/libs/common/storage/storage.client';

@Injectable()
export class S3StorageClient extends StorageClient {
  private readonly logger: Logger = new Logger(S3StorageClient.name);

  private readonly s3: S3Client;
  private readonly region: string;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.region = this.configService.getOrThrow<string>('AWS_REGION');
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: File, key: string): Promise<UploadFileResponse> {
    if (!file.originalname || !file.buffer) {
      throw new BadRequestException('Invalid file: missing originalname or buffer');
    }

    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const fullKey = `${key}/${uuid()}-${sanitizedFilename}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fullKey,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
          Metadata: {
            originalName: file.originalname,
            sanitizedName: sanitizedFilename,
            uploadedAt: new Date().toISOString(),
          },
        })
      );

      this.logger.log(`File uploaded successfully: ${fullKey}`);
      return { url: this.getFileUrl(fullKey), key: fullKey };
    } catch (error) {
      this.logger.error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new InternalServerErrorException(
        `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new InternalServerErrorException(
        `Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async changeFile(newFile: File, path: string, oldKey: string): Promise<UploadFileResponse> {
    const uploaded = await this.uploadFile(newFile, path);
    try {
      await this.deleteFile(oldKey);
    } catch (error) {
      this.logger.error(
        `Failed to delete old file after upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      // 로그만 남기고 진행
    }

    return uploaded;
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * 파일명을 안전하게 정리합니다.
   */
  private sanitizeFilename(filename: string): string {
    const name = filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // 특수문자를 _로 변경
      .replace(/_+/g, '_') // 연속된 _를 하나로
      .replace(/^_|_$/g, ''); // 앞뒤 _제거

    // 파일명이 비어있으면 현재 시간으로 대체
    return name.length > 0 ? name : `file-${Date.now()}`;
  }
}
