import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { TicketHistoryRepository } from '~/modules/ticket-history/application/port/out/ticket-history-repository.port';
import { TicketHistory } from '~/modules/ticket-history/domain/model/ticket-history';
import { TicketHistoryEntity } from '~/modules/ticket-history/infrastructure/repository/typeorm/entity/ticket-history.entity';
import { TicketHistoryMapper } from '~/modules/ticket-history/infrastructure/repository/typeorm/mapper/ticket-history.mapper';

@Injectable()
export class TypeOrmTicketHistoryRepository extends TicketHistoryRepository {
  constructor(
    @InjectRepository(TicketHistoryEntity)
    private readonly ormRepo: Repository<TicketHistoryEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: TicketHistory): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: TicketHistory): Promise<void> {
    const entity = TicketHistoryMapper.toEntity(aggregate);
    await this.ormRepo.save(entity);
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: TicketHistory[]): Promise<void> {
    const entities = aggregates.map((history) => TicketHistoryMapper.toEntity(history));
    await this.ormRepo.save(entities);
    await Promise.all(aggregates.map((history) => this.emitEvent(history)));
  }

  async findById(id: string): Promise<TicketHistory | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
    });
    return entity ? TicketHistoryMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<TicketHistory[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => TicketHistoryMapper.toDomain(e));
  }

  async findByUserIdWithCursor(
    userId: string,
    cursorParam: CursorPaginationParam
  ): Promise<PaginatedResult<TicketHistory>> {
    const { limit, cursor, order = 'DESC' } = cursorParam;

    const histories = await this.ormRepo.find({
      // For HasNextPage
      take: limit + 1,
      order: {
        createdAt: order,
      },
      where: {
        userId,
        createdAt: cursor
          ? order === 'DESC'
            ? LessThan(DateUtil.toUtcDate(cursor))
            : MoreThan(DateUtil.toUtcDate(cursor))
          : undefined,
      },
    });

    const hasNext = histories.length > limit;
    const sliced = hasNext ? histories.slice(0, limit) : histories;
    const items = sliced.map((e) => TicketHistoryMapper.toDomain(e));
    const nextCursor = hasNext ? DateUtil.formatDate(sliced[sliced.length - 1].createdAt) : null;

    return {
      items,
      nextCursor,
      hasNext,
    };
  }
}
