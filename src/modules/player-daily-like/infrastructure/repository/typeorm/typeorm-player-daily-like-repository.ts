import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { PlayerDailyLikeRepository } from '~/modules/player-daily-like/application/port/out/player-daily-like-repository.port';
import { PlayerDailyLike } from '~/modules/player-daily-like/domain/model/player-daily-like';
import { PlayerDailyLikeEntity } from '~/modules/player-daily-like/infrastructure/repository/typeorm/entity/player-daily-like.entity';
import { PlayerDailyLikeMapper } from '~/modules/player-daily-like/infrastructure/repository/typeorm/mapper/player-daily-like.mapper';

@Injectable()
export class TypeOrmPlayerDailyLikeRepository extends PlayerDailyLikeRepository {
  constructor(
    @InjectRepository(PlayerDailyLikeEntity)
    private readonly ormRepo: Repository<PlayerDailyLikeEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: PlayerDailyLike): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(playerDailyLike: PlayerDailyLike): Promise<void> {
    const entity = PlayerDailyLikeMapper.toEntity(playerDailyLike);
    await this.ormRepo.save(entity);
    await this.emitEvent(playerDailyLike);
  }

  async saveAll(playerDailyLikes: PlayerDailyLike[]): Promise<void> {
    const entities = playerDailyLikes.map((playerDailyLike) => PlayerDailyLikeMapper.toEntity(playerDailyLike));
    await this.ormRepo.save(entities);
    await Promise.all(playerDailyLikes.map((playerDailyLike) => this.emitEvent(playerDailyLike)));
  }

  async findById(id: string): Promise<PlayerDailyLike | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? PlayerDailyLikeMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<PlayerDailyLike[]> {
    const entities = await this.ormRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => PlayerDailyLikeMapper.toDomain(entity));
  }

  async findRecentOneByUserId(userId: string): Promise<PlayerDailyLike | null> {
    const entity = await this.ormRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return entity ? PlayerDailyLikeMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<PlayerDailyLike[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => PlayerDailyLikeMapper.toDomain(entity));
  }
}
