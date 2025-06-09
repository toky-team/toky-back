import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { ActiveUserStore } from '~/modules/chat/application/port/out/active-user-store.port';

@Injectable()
export class RedisActiveUserStore extends ActiveUserStore implements OnModuleInit, OnModuleDestroy {
  private readonly PREFIX = 'active-users';

  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  onModuleInit(): void {
    const redisOptions = {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    };

    this.redis = new Redis(redisOptions);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.redis.quit()]);
  }

  async setOnline(userId: string): Promise<void> {
    const key = `${this.PREFIX}:${userId}`;
    const value = '1';
    await this.redis.set(key, value, 'EX', 60); // Set expiration to 1 minute
  }

  async refresh(userId: string): Promise<void> {
    const key = `${this.PREFIX}:${userId}`;
    await this.redis.expire(key, 60); // Refresh expiration to 1 minute
  }

  async remove(userId: string): Promise<void> {
    const key = `${this.PREFIX}:${userId}`;
    await this.redis.del(key);
  }

  async count(): Promise<number> {
    let cursor = '0';
    let count = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${this.PREFIX}:*`,
        'COUNT',
        100 // 한 번에 최대 100개씩 처리
      );
      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== '0');

    return count;
  }
}
