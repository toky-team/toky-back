import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { PlayerLikeRepository } from '~/modules/player-like/application/port/out/player-like-repository.port';
import { PlayerLike } from '~/modules/player-like/domain/model/player-like';
import { PlayerLikeEntity } from '~/modules/player-like/infrastructure/repository/typeorm/entity/player-like.entity';
import { PlayerLikeMapper } from '~/modules/player-like/infrastructure/repository/typeorm/mapper/player-like.mapper';

@Injectable()
export class TypeOrmPlayerLikeRepository extends PlayerLikeRepository {
  constructor(
    @InjectRepository(PlayerLikeEntity)
    private readonly ormRepo: Repository<PlayerLikeEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: PlayerLike): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(playerLike: PlayerLike): Promise<void> {
    const entity = PlayerLikeMapper.toEntity(playerLike);
    await this.ormRepo.save(entity);
    await this.emitEvent(playerLike);
  }

  async saveAll(playerLikes: PlayerLike[]): Promise<void> {
    const entities = playerLikes.map((playerLike) => PlayerLikeMapper.toEntity(playerLike));
    await this.ormRepo.save(entities);
    await Promise.all(playerLikes.map((playerLike) => this.emitEvent(playerLike)));
  }

  async findById(id: string): Promise<PlayerLike | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? PlayerLikeMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<PlayerLike[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => PlayerLikeMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<PlayerLike[]> {
    const entities = await this.ormRepo.find({ where: { userId } });
    return entities.map((entity) => PlayerLikeMapper.toDomain(entity));
  }

  async findByUserIdAndPlayerId(userId: string, playerId: string): Promise<PlayerLike | null> {
    const entity = await this.ormRepo.findOne({ where: { userId, playerId } });
    return entity ? PlayerLikeMapper.toDomain(entity) : null;
  }
}
