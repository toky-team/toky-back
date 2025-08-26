import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class RedisConfig {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Redis 클라이언트 인스턴스를 생성합니다.
   */
  createRedisClient(): Redis {
    const redisOptions = this.getRedisOptions();
    return new Redis(redisOptions);
  }

  /**
   * Redis 연결 설정 옵션을 반환합니다.
   * BullMQ 등에서 연결 설정만 필요한 경우 사용됩니다.
   */
  getRedisOptions(): RedisOptions {
    return {
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      db: this.configService.get<number>('REDIS_DB') || 0,
    };
  }
}
