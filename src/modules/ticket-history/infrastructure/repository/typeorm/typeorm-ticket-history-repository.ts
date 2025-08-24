import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { CursorData } from '~/libs/interfaces/cursor-pagination/cursor.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { CursorUtil } from '~/libs/utils/cursor.util';
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

    let cursorData: CursorData | null = null;
    if (cursor) {
      try {
        const parsed = CursorUtil.parseCursorData(cursor);
        cursorData = parsed;
      } catch (error) {
        throw new DomainException(
          'TICKET_HISTORY',
          `커서값이 유효하지 않습니다: ${error instanceof Error ? error.message : error}`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const queryBuilder = this.ormRepo
      .createQueryBuilder('ticket_history')
      .where('ticket_history.userId = :userId', { userId })
      .orderBy('ticket_history.createdAt', order)
      .addOrderBy('ticket_history.id', order)
      .take(limit + 1);

    if (cursorData) {
      const { createdAt, id } = cursorData;

      if (order === 'DESC') {
        queryBuilder.andWhere('(ticket_history.createdAt, ticket_history.id) < (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: createdAt,
          cursorId: id,
        });
      } else {
        queryBuilder.andWhere('(ticket_history.createdAt, ticket_history.id) > (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: createdAt,
          cursorId: id,
        });
      }
    }

    const histories = await queryBuilder.getMany();

    const hasNext = histories.length > limit;
    const sliced = hasNext ? histories.slice(0, limit) : histories;
    let nextCursor: string | null = null;
    if (hasNext && sliced.length > 0) {
      const lastMessage = sliced[sliced.length - 1];
      const cursorData: CursorData = {
        id: lastMessage.id,
        createdAt: lastMessage.createdAt,
      };
      nextCursor = CursorUtil.createCursor(cursorData);
    }
    const items = sliced.map((e) => TicketHistoryMapper.toDomain(e));

    return {
      items,
      nextCursor,
      hasNext,
    };
  }
}
