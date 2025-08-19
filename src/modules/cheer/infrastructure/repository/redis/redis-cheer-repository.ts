import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { Cheer } from '~/modules/cheer/domain/model/cheer';
import { isCheerPrimitives } from '~/modules/cheer/utils/cheer-primitive.guard';

@Injectable()
export class RedisCheerRepository extends CheerRepository implements OnModuleInit, OnModuleDestroy {
  private readonly CHEER_KEY_PREFIC = 'cheer:';

  private redisClient: Redis;

  constructor(
    private readonly eventBus: EventBus,
    private readonly redisConfig: RedisConfig
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    this.redisClient = this.redisConfig.createRedisClient();
    await this.redisClient.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }

  private async emitEvent(aggregate: Cheer): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: Cheer): Promise<void> {
    const key = `${this.CHEER_KEY_PREFIC}${aggregate.sport}`;
    await this.redisClient.set(key, JSON.stringify(aggregate.toPrimitives()));
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: Cheer[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    for (const aggregate of aggregates) {
      const key = `${this.CHEER_KEY_PREFIC}${aggregate.sport}`;
      pipeline.set(key, JSON.stringify(aggregate.toPrimitives()));
    }
    await pipeline.exec();
    await Promise.all(aggregates.map((cheer) => this.emitEvent(cheer)));
  }

  async findById(_id: string): Promise<Cheer | null> {
    // Redis repository does not support finding by ID
    return Promise.resolve(null);
  }

  async findAll(): Promise<Cheer[]> {
    const sports = Object.values(Sport);
    const Cheers: Cheer[] = [];

    for (const sport of sports) {
      const cheer = await this.findBySport(sport);
      if (cheer) {
        Cheers.push(cheer);
      }
    }
    return Cheers;
  }

  async findBySport(sport: Sport): Promise<Cheer | null> {
    const key = `${this.CHEER_KEY_PREFIC}${sport}`;
    const data = await this.redisClient.get(key);

    if (!data) {
      return null;
    }

    try {
      const parsedData = JSON.parse(data);
      if (!isCheerPrimitives(parsedData)) {
        return null;
      }
      return Cheer.reconstruct(parsedData);
    } catch {
      return null;
    }
  }
}
