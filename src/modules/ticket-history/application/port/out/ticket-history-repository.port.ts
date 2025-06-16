import { Repository } from '~/libs/core/application-core/repository.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { TicketHistory } from '~/modules/ticket-history/domain/model/ticket-history';

export abstract class TicketHistoryRepository extends Repository<TicketHistory> {
  abstract findByUserIdWithCursor(
    userId: string,
    cursorParam: CursorPaginationParam
  ): Promise<PaginatedResult<TicketHistory>>;
}
