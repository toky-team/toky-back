import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { CryptoUtil } from '~/libs/common/cryptos/crypto.util';

@Injectable()
export class AesCryptoUtil extends CryptoUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    super();
    const keyString = this.configService.getOrThrow<string>('AES_KEY');
    this.key = Buffer.from(keyString, 'hex');
  }

  encryptData(data: string): string {
    try {
      // 입력 검증
      if (!data || typeof data !== 'string') {
        throw new Error('Invalid input data');
      }

      // 랜덤 IV 생성
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);

      // 암호화 수행
      const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);

      // IV와 암호화된 데이터를 결합 후 base64로 인코딩
      const combined = Buffer.concat([iv, encrypted]);
      return combined.toString('base64');
    } catch {
      throw new BadRequestException('암호화에 실패했습니다');
    }
  }

  decryptData(encryptedData: string): string {
    try {
      // 입력 검증
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data');
      }

      // base64 디코딩
      const combined = Buffer.from(encryptedData, 'base64');

      // 최소 길이 검증 (IV 16바이트 + 최소 암호화 데이터)
      if (combined.length < 32) {
        throw new Error('Invalid encrypted data length');
      }

      // IV와 암호화된 데이터 분리
      const iv = combined.subarray(0, 16);
      const encrypted = combined.subarray(16);

      // 복호화 수행
      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      const result = decrypted.toString('utf8');

      // 결과 검증
      if (!result) {
        throw new Error('Decryption resulted in empty string');
      }

      return result;
    } catch {
      throw new BadRequestException('복호화에 실패했습니다');
    }
  }
}
