import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { TicketHistoryFacade } from '~/modules/ticket-history/application/port/in/ticket-history-facade.port';
import { TicketHistoryPersister } from '~/modules/ticket-history/application/service/ticket-history.persister';
import { TicketHistoryReader } from '~/modules/ticket-history/application/service/ticket-history.reader';
import { TicketHistory, TicketHistoryPrimitives } from '~/modules/ticket-history/domain/model/ticket-history';

@Injectable()
export class TicketHistoryFacadeImpl extends TicketHistoryFacade {
  constructor(
    private readonly ticketHistoryReader: TicketHistoryReader,
    private readonly ticketHistoryPersister: TicketHistoryPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async createTicketHistory(
    userId: string,
    reason: string,
    changeAmount: number,
    resultAmount: number
  ): Promise<TicketHistoryPrimitives> {
    const ticketHistory = TicketHistory.create(
      this.idGenerator.generateId(),
      userId,
      reason,
      changeAmount,
      resultAmount
    );
    await this.ticketHistoryPersister.save(ticketHistory);
    return ticketHistory.toPrimitives();
  }

  async getTicketHistoriesByUserIdWithCursor(
    userId: string,
    param: CursorPaginationParam
  ): Promise<PaginatedResult<TicketHistoryPrimitives>> {
    const result = await this.ticketHistoryReader.findByUserIdWithCursor(userId, param);
    return {
      ...result,
      items: result.items.map((item) => item.toPrimitives()),
    };
  }
}
