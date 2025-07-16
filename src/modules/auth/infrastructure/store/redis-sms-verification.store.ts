import { BadRequestException, HttpStatus, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { SmsClient } from '~/libs/common/sms/sms.client';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { SmsVerificationStore } from '~/modules/auth/application/port/out/sms-verification.store';

interface VerificationData {
  code: string;
  expiresAt: number;
  verified: boolean;
  attempts: number;
}

@Injectable()
export class RedisSmsVerificationStore extends SmsVerificationStore implements OnModuleInit, OnModuleDestroy {
  private readonly prefix = 'sms_verification';
  private readonly expirationMinutes: number;
  private readonly maxAttempts: number;

  private redis: Redis;

  constructor(
    private readonly smsClient: SmsClient,
    private readonly redisConfig: RedisConfig,
    private readonly configService: ConfigService
  ) {
    super();
    this.expirationMinutes = this.configService.getOrThrow<number>('SMS_EXPIRATION_MINUTES');
    this.maxAttempts = this.configService.getOrThrow<number>('SMS_MAX_ATTEMPTS');
  }

  onModuleInit(): void {
    this.redis = this.redisConfig.createRedisClient();
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.redis.quit()]);
  }

  async createVerificationCode(phoneNumber: string): Promise<void> {
    const code = this.generateCode();
    const expiresAt = Date.now() + this.expirationMinutes * 60 * 1000;

    const verification: VerificationData = {
      code,
      expiresAt,
      verified: false,
      attempts: 0,
    };

    // Redis에 저장 (TTL 설정)
    const key = `${this.prefix}:${phoneNumber}`;
    await this.redis.set(key, JSON.stringify(verification), 'EX', this.expirationMinutes * 60);

    // SMS 발송
    const message = `[TOKY] 휴대폰 인증번호는 [${code}]입니다.`;
    await this.smsClient.sendSms(phoneNumber, message);
  }

  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await this.getVerification(phoneNumber);

    if (!verification) {
      throw new DomainException('AUTH', '유효하지 않은 인증 요청입니다.', HttpStatus.BAD_REQUEST);
    }

    if (verification.expiresAt < Date.now()) {
      throw new DomainException('AUTH', '인증번호가 만료되었습니다.', HttpStatus.BAD_REQUEST);
    }

    if (verification.verified) {
      return true; // 이미 인증 완료
    }

    if (verification.attempts >= this.maxAttempts) {
      throw new DomainException('AUTH', '인증 시도 횟수를 초과했습니다.', HttpStatus.BAD_REQUEST);
    }

    // 시도 횟수 증가
    verification.attempts++;
    await this.saveVerification(phoneNumber, verification);

    if (verification.code !== code) {
      const remaining = this.maxAttempts - verification.attempts;
      throw new BadRequestException(`인증번호가 일치하지 않습니다. (남은 시도: ${remaining}회)`);
    }

    // 인증 성공
    verification.verified = true;
    await this.saveVerification(phoneNumber, verification);

    return true;
  }

  async isVerified(phoneNumber: string): Promise<boolean> {
    const verification = await this.getVerification(phoneNumber);

    return verification?.verified === true && verification?.expiresAt > Date.now();
  }

  private async getVerification(phoneNumber: string): Promise<VerificationData | null> {
    const key = `${this.prefix}:${phoneNumber}`;
    const data = await this.redis.get(key);
    if (!data) {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      return this.validateVerificationData(parsed);
    } catch {
      return null;
    }
  }

  private async saveVerification(phoneNumber: string, verification: VerificationData): Promise<void> {
    const key = `${this.prefix}:${phoneNumber}`;
    const ttl = Math.max(1, Math.ceil((verification.expiresAt - Date.now()) / 1000));
    await this.redis.set(key, JSON.stringify(verification), 'EX', ttl);
  }

  private generateCode(): string {
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  }

  /**
   * 파싱된 데이터가 VerificationData 타입인지 검증합니다.
   */
  private validateVerificationData(data: unknown): VerificationData | null {
    if (typeof data !== 'object' || data === null) {
      return null;
    }

    const obj = data as Record<string, unknown>;

    // 필수 필드 검증
    if (
      typeof obj.code !== 'string' ||
      typeof obj.expiresAt !== 'number' ||
      typeof obj.verified !== 'boolean' ||
      typeof obj.attempts !== 'number'
    ) {
      return null;
    }

    return {
      code: obj.code,
      expiresAt: obj.expiresAt,
      verified: obj.verified,
      attempts: obj.attempts,
    };
  }
}
