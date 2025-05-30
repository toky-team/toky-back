import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv } from 'crypto';

import { CryptoUtil } from '~/modules/common/application/port/in/crypto.util';

@Injectable()
export class AesCryptoUtil extends CryptoUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private readonly configService: ConfigService) {
    super();
    this.key = Buffer.from(this.configService.getOrThrow<string>('AES_KEY'), 'hex');
    this.iv = Buffer.from(this.configService.getOrThrow<string>('AES_IV'), 'hex');
  }

  encryptData(data: string): string {
    try {
      const cipher = createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch {
      throw new BadRequestException('암호화에 실패했습니다');
    }
  }

  decryptData(encryptedData: string): string {
    try {
      const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      throw new BadRequestException('복호화에 실패했습니다.');
    }
  }
}
