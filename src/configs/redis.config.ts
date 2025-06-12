import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class RedisConfig {
  constructor(private readonly configService: ConfigService) {}

  createRedisClient(): Redis {
    const redisOptions: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    };

    return new Redis(redisOptions);
  }
}
