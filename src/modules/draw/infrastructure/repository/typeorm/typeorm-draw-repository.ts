import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DrawRepository } from '~/modules/draw/application/port/out/draw-repository.port';
import { Draw } from '~/modules/draw/domain/model/draw';
import { DrawEntity } from '~/modules/draw/infrastructure/repository/typeorm/entity/draw.entity';
import { DrawMapper } from '~/modules/draw/infrastructure/repository/typeorm/mapper/draw.mapper';

interface DrawFindManyOption {
  userId?: string;
  giftId?: string;
}

@Injectable()
export class TypeOrmDrawRepository extends DrawRepository {
  constructor(
    @InjectRepository(DrawEntity)
    private readonly ormRepo: Repository<DrawEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Draw): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(draw: Draw): Promise<void> {
    const entity = DrawMapper.toEntity(draw);
    await this.ormRepo.save(entity);
    await this.emitEvent(draw);
  }

  async saveAll(draws: Draw[]): Promise<void> {
    const entities = draws.map((draw) => DrawMapper.toEntity(draw));
    await this.ormRepo.save(entities);
    await Promise.all(draws.map((draw) => this.emitEvent(draw)));
  }

  async findById(id: string): Promise<Draw | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? DrawMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Draw[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => DrawMapper.toDomain(entity));
  }

  async findMany(options: DrawFindManyOption): Promise<Draw[]> {
    const entities = await this.ormRepo.find({
      where: {
        userId: options.userId,
        giftId: options.giftId,
      },
    });
    return entities.map((entity) => DrawMapper.toDomain(entity));
  }
}
