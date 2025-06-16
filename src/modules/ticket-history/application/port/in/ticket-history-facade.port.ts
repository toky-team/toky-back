import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { TicketHistoryPrimitives } from '~/modules/ticket-history/domain/model/ticket-history';

export abstract class TicketHistoryFacade {
  abstract createTicketHistory(
    userId: string,
    reason: string,
    changeAmount: number,
    resultAmount: number
  ): Promise<TicketHistoryPrimitives>;
  abstract getTicketHistoriesByUserIdWithCursor(
    userId: string,
    param: CursorPaginationParam
  ): Promise<PaginatedResult<TicketHistoryPrimitives>>;
}
