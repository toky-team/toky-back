import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { DistributedLock } from '~/libs/common/distributed-lock/distributed-lock.interface';

@Injectable()
export class RedisDistributedLock implements DistributedLock {
  private redis: Redis;

  constructor(private readonly redisConfig: RedisConfig) {
    this.redis = new Redis(this.redisConfig.getRedisOptions());
  }

  /**
   * 분산 락 획득
   */
  async acquireLock(
    key: string,
    ttl: number = 5000,
    retryDelay: number = 100,
    maxRetries: number = 10
  ): Promise<string | null> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;

    for (let i = 0; i < maxRetries; i++) {
      const result = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
      if (result === 'OK') {
        return lockValue;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    return null;
  }

  /**
   * 분산 락 해제
   */
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(luaScript, 1, lockKey, lockValue);
    return result === 1;
  }

  /**
   * 락과 함께 작업 실행
   */
  async withLock<T>(key: string, operation: () => Promise<T>, ttl: number = 5000): Promise<T> {
    const lockValue = await this.acquireLock(key, ttl);
    if (!lockValue) {
      throw new Error(`Failed to acquire lock for key: ${key}`);
    }

    try {
      return await operation();
    } finally {
      await this.releaseLock(key, lockValue);
    }
  }
}
