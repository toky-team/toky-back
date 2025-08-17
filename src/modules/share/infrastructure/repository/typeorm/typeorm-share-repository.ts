import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { ShareRepository } from '~/modules/share/application/port/out/share-repository.port';
import { Share } from '~/modules/share/domain/model/share';
import { ShareEntity } from '~/modules/share/infrastructure/repository/typeorm/entity/share.entity';
import { ShareMapper } from '~/modules/share/infrastructure/repository/typeorm/mapper/share.mapper';

@Injectable()
export class TypeOrmShareRepository extends ShareRepository {
  constructor(
    @InjectRepository(ShareEntity)
    private readonly ormRepo: Repository<ShareEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Share): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(share: Share): Promise<void> {
    const entity = ShareMapper.toEntity(share);
    await this.ormRepo.save(entity);
    await this.emitEvent(share);
  }

  async saveAll(shares: Share[]): Promise<void> {
    const entities = shares.map((share) => ShareMapper.toEntity(share));
    await this.ormRepo.save(entities);
    await Promise.all(shares.map((share) => this.emitEvent(share)));
  }

  async findById(id: string): Promise<Share | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? ShareMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Share[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => ShareMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<Share | null> {
    const entity = await this.ormRepo.findOne({ where: { userId } });
    return entity ? ShareMapper.toDomain(entity) : null;
  }
}
