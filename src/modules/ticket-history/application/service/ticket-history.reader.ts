import { Injectable } from '@nestjs/common';

import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { TicketHistoryRepository } from '~/modules/ticket-history/application/port/out/ticket-history-repository.port';
import { TicketHistory } from '~/modules/ticket-history/domain/model/ticket-history';

@Injectable()
export class TicketHistoryReader {
  constructor(private readonly ticketHistoryRepository: TicketHistoryRepository) {}

  async findById(ticketHistoryId: string): Promise<TicketHistory | null> {
    return this.ticketHistoryRepository.findById(ticketHistoryId);
  }

  async findByUserIdWithCursor(
    userId: string,
    cursorParam: CursorPaginationParam
  ): Promise<PaginatedResult<TicketHistory>> {
    const defaultParam: CursorPaginationParam = {
      limit: cursorParam.limit ?? 20,
      order: cursorParam.order ?? 'DESC',
      cursor: cursorParam.cursor,
    };
    return this.ticketHistoryRepository.findByUserIdWithCursor(userId, defaultParam);
  }
}
