import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { Cheer } from '~/modules/cheer/domain/model/cheer';
import { CheerEntity } from '~/modules/cheer/infrastructure/repository/typeorm/entity/cheer.entity';
import { CheerMapper } from '~/modules/cheer/infrastructure/repository/typeorm/mapper/cheer.mapper';

@Injectable()
export class TypeOrmCheerRepository extends CheerRepository {
  constructor(
    @InjectRepository(CheerEntity)
    private readonly ormRepo: Repository<CheerEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Cheer): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(cheer: Cheer): Promise<void> {
    const entity = CheerMapper.toEntity(cheer);
    await this.ormRepo.save(entity);
    await this.emitEvent(cheer);
  }

  async saveAll(cheers: Cheer[]): Promise<void> {
    const entities = cheers.map((cheer) => CheerMapper.toEntity(cheer));
    await this.ormRepo.save(entities);
    await Promise.all(cheers.map((cheer) => this.emitEvent(cheer)));
  }

  async findById(id: string): Promise<Cheer | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? CheerMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Cheer[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => CheerMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<Cheer | null> {
    const entity = await this.ormRepo.findOne({ where: { userId } });
    return entity ? CheerMapper.toDomain(entity) : null;
  }
}
