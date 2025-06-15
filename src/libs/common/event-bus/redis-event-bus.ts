import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { DomainEvent, EventConstructor } from '~/libs/core/domain-core/domain-event';

@Injectable()
export class RedisEventBus extends EventBus implements OnModuleInit, OnModuleDestroy {
  private lockRedis: Redis;
  private readonly handlers: Map<EventConstructor<DomainEvent>, Set<(event: DomainEvent) => void | Promise<void>>>;
  private readonly logger = new Logger(RedisEventBus.name);

  constructor(
    private readonly pubSubClient: PubSubClient,
    private readonly redisConfig: RedisConfig
  ) {
    super();
    this.handlers = new Map();
  }

  onModuleInit(): void {
    this.lockRedis = this.redisConfig.createRedisClient();
  }

  async onModuleDestroy(): Promise<void> {
    await this.lockRedis.quit();
  }

  async emit<E extends DomainEvent>(event: E): Promise<void> {
    await this.pubSubClient.publish(event.eventName, { ...event.toJSON() });
  }

  async subscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void> {
    if (!this.handlers.has(eventClass)) {
      this.handlers.set(eventClass, new Set());

      await this.pubSubClient.subscribe(eventClass.eventName, async (message: Record<string, unknown>) => {
        const event = eventClass.fromJSON(message);
        const lockKey = `lock:${event.eventName}:${event.aggregateId}`;
        const acquired = await this.lockRedis.set(lockKey, 'locked', 'EX', 60, 'NX');
        if (!acquired) return;

        const handlers = this.handlers.get(eventClass);
        if (!handlers) return;

        for (const handler of handlers) {
          try {
            await handler(event);
          } catch (error) {
            this.logger.error(`Error handling event ${event.eventName}: ${error}`);
          }
        }
      });
    }

    this.handlers.get(eventClass)!.add(handler);
  }

  async unsubscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void> {
    const handlers = this.handlers.get(eventClass);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventClass);
        await this.pubSubClient.unsubscribe(eventClass.eventName);
      }
    }
  }
}
