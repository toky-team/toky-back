import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisConfig } from '~/configs/redis.config';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { ScoreRepository } from '~/modules/score/application/port/out/score-repository.port';
import { Score } from '~/modules/score/domain/model/score';
import { isScorePrimitive } from '~/modules/score/utils/score-primitive.guard';

@Injectable()
export class RedisScoreRepository extends ScoreRepository implements OnModuleInit, OnModuleDestroy {
  private readonly SCORE_KEY_PREFIX = 'score:';

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

  private async emitEvent(aggregate: Score): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: Score): Promise<void> {
    const key = `${this.SCORE_KEY_PREFIX}${aggregate.sport}`;
    await this.redisClient.set(key, JSON.stringify(aggregate.toPrimitives()));
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: Score[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    for (const aggregate of aggregates) {
      const key = `${this.SCORE_KEY_PREFIX}${aggregate.sport}`;
      pipeline.set(key, JSON.stringify(aggregate.toPrimitives()));
    }
    await pipeline.exec();
    await Promise.all(aggregates.map((score) => this.emitEvent(score)));
  }

  async findById(_id: string): Promise<Score | null> {
    // redis repository does not support finding by ID
    return Promise.resolve(null);
  }

  async findAll(): Promise<Score[]> {
    const sports = Object.values(Sport);
    const scores: Score[] = [];

    for (const sport of sports) {
      const score = await this.findBySport(sport);
      if (score) {
        scores.push(score);
      }
    }
    return scores;
  }

  async findBySport(sport: Sport): Promise<Score | null> {
    const key = `${this.SCORE_KEY_PREFIX}${sport}`;
    const data = await this.redisClient.get(key);

    if (data === null) {
      return null;
    }

    try {
      const parsedData = JSON.parse(data);
      // 스키마가 맞지 않을 때
      if (!isScorePrimitive(parsedData)) {
        return null;
      }

      // Redis에서 읽어온 문자열 날짜를 Dayjs로 변환
      const scorePrimitives = {
        ...parsedData,
        createdAt: DateUtil.toKst(parsedData.createdAt),
        updatedAt: DateUtil.toKst(parsedData.updatedAt),
      };

      return Score.reconstruct(scorePrimitives);
    } catch {
      return null;
    }
  }
}
