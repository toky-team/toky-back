import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { LikeRepository } from '~/modules/like/application/port/out/like-repository.port';
import { Like } from '~/modules/like/domain/model/like';
import { isLikePrimitives } from '~/modules/like/utils/like-primitive.guard';

@Injectable()
export class RedisLikeRepository extends LikeRepository implements OnModuleInit, OnModuleDestroy {
  private readonly LIKE_KEY_PREFIX = 'like:';

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

  private async emitEvent(aggregate: Like): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: Like): Promise<void> {
    const key = `${this.LIKE_KEY_PREFIX}${aggregate.sport}`;
    await this.redisClient.set(key, JSON.stringify(aggregate.toPrimitives()));
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: Like[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    for (const aggregate of aggregates) {
      const key = `${this.LIKE_KEY_PREFIX}${aggregate.sport}`;
      pipeline.set(key, JSON.stringify(aggregate.toPrimitives()));
    }
    await pipeline.exec();
    await Promise.all(aggregates.map((like) => this.emitEvent(like)));
  }

  async findById(_id: string): Promise<Like | null> {
    // Redis repository does not support finding by ID
    return Promise.resolve(null);
  }

  async findAll(): Promise<Like[]> {
    const sports = Object.values(Sport);
    const likes: Like[] = [];

    for (const sport of sports) {
      const like = await this.findBySport(sport);
      if (like) {
        likes.push(like);
      }
    }
    return likes;
  }

  async findBySport(sport: Sport): Promise<Like | null> {
    const key = `${this.LIKE_KEY_PREFIX}${sport}`;
    const data = await this.redisClient.get(key);

    if (!data) {
      return null;
    }

    try {
      const parsedData = JSON.parse(data);
      if (!isLikePrimitives(parsedData)) {
        return null;
      }

      // Redis에서 읽어온 문자열 날짜를 Dayjs로 변환
      const likePrimitives = {
        ...parsedData,
        createdAt: DateUtil.toKst(parsedData.createdAt),
        updatedAt: DateUtil.toKst(parsedData.updatedAt),
      };

      return Like.reconstruct(likePrimitives);
    } catch {
      return null;
    }
  }
}
