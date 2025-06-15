import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { TicketRepository } from '~/modules/ticket/application/port/out/ticket-repository.port';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';
import { TicketCountEntity } from '~/modules/ticket/infrastructure/repository/entity/ticket-count.entity';
import { TicketMapper } from '~/modules/ticket/infrastructure/repository/mapper/ticket.mapper';

@Injectable()
export class TypeOrmTicketRepository extends TicketRepository {
  constructor(
    @InjectRepository(TicketCountEntity)
    private readonly ormRepo: Repository<TicketCountEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: TicketCount): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: TicketCount): Promise<void> {
    const entity = TicketMapper.toEntity(aggregate);
    await this.ormRepo.save(entity);
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: TicketCount[]): Promise<void> {
    const entities = aggregates.map((ticket) => TicketMapper.toEntity(ticket));
    await this.ormRepo.save(entities);
    await Promise.all(aggregates.map((ticket) => this.emitEvent(ticket)));
  }

  async findById(id: string): Promise<TicketCount | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
    });
    return entity ? TicketMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<TicketCount[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => TicketMapper.toDomain(e));
  }

  async findByUserId(userId: string): Promise<TicketCount | null> {
    const entity = await this.ormRepo.findOne({
      where: { userId },
    });
    return entity ? TicketMapper.toDomain(entity) : null;
  }
}
