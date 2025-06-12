import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';

@Injectable()
export class RedisPubSubClient extends PubSubClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubClient.name);

  private pub: Redis;
  private sub: Redis;
  private listeners: Map<string, (message: Record<string, unknown>) => void>;

  constructor(private readonly redisConfig: RedisConfig) {
    super();
  }

  onModuleInit(): void {
    this.pub = this.redisConfig.createRedisClient();
    this.sub = this.redisConfig.createRedisClient();
    this.listeners = new Map();

    this.sub.on('message', (channel: string, rawMessage: string) => {
      const callback = this.listeners.get(channel);
      if (callback === undefined) {
        return;
      }

      try {
        const parsedMessage = JSON.parse(rawMessage) as Record<string, unknown>;
        callback(parsedMessage);
      } catch (error) {
        this.logger.error(`Failed to parse message from channel ${channel}: ${error}`);
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.pub.quit(), this.sub.quit()]);
  }

  async publish(channel: string, message: Record<string, unknown>): Promise<void> {
    const rawMessage = JSON.stringify(message);
    await this.pub.publish(channel, rawMessage);
  }

  async subscribe(channel: string, callback: (message: Record<string, unknown>) => void): Promise<void> {
    this.listeners.set(channel, callback);
    await this.sub.subscribe(channel);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.listeners.delete(channel);
    await this.sub.unsubscribe(channel);
  }
}
