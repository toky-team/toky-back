import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { GiftRepository } from '~/modules/gift/application/port/out/gift-repository.port';
import { Gift } from '~/modules/gift/domain/model/gift';
import { GiftEntity } from '~/modules/gift/infrastructure/repository/typeorm/entity/gift.entity';
import { GiftMapper } from '~/modules/gift/infrastructure/repository/typeorm/mapper/gift.mapper';

@Injectable()
export class TypeOrmGiftRepository extends GiftRepository {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly ormRepo: Repository<GiftEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Gift): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(gift: Gift): Promise<void> {
    const entity = GiftMapper.toEntity(gift);
    await this.ormRepo.save(entity);
    await this.emitEvent(gift);
  }

  async saveAll(gifts: Gift[]): Promise<void> {
    const entities = gifts.map((gift) => GiftMapper.toEntity(gift));
    await this.ormRepo.save(entities);
    await Promise.all(gifts.map((gift) => this.emitEvent(gift)));
  }

  async findById(id: string): Promise<Gift | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? GiftMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Gift[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => GiftMapper.toDomain(entity));
  }
}
