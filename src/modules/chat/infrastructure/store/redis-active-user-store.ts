import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { Sport } from '~/libs/enums/sport';
import { ActiveUserStore } from '~/modules/chat/application/port/out/active-user-store.port';

@Injectable()
export class RedisActiveUserStore extends ActiveUserStore implements OnModuleInit, OnModuleDestroy {
  private readonly PREFIX = 'active-users';

  private redis: Redis;

  constructor(private readonly redisConfig: RedisConfig) {
    super();
  }

  onModuleInit(): void {
    this.redis = this.redisConfig.createRedisClient();
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.redis.quit()]);
  }

  async setOnline(userId: string, sport: Sport): Promise<void> {
    const key = `${this.PREFIX}-${sport}:${userId}`;
    const value = '1';
    await this.redis.set(key, value, 'EX', 60); // Set expiration to 1 minute
  }

  async refresh(userId: string, sport: Sport): Promise<void> {
    const key = `${this.PREFIX}-${sport}:${userId}`;
    await this.redis.expire(key, 60); // Refresh expiration to 1 minute
  }

  async remove(userId: string, sport: Sport): Promise<void> {
    const key = `${this.PREFIX}-${sport}:${userId}`;
    await this.redis.del(key);
  }

  async count(sport: Sport): Promise<number> {
    let cursor = '0';
    let count = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${this.PREFIX}-${sport}:*`,
        'COUNT',
        100 // 한 번에 최대 100개씩 처리
      );
      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== '0');

    return count;
  }
}
