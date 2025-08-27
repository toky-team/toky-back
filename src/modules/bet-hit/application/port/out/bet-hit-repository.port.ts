import { Repository } from '~/libs/core/application-core/repository.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { BetHit } from '~/modules/bet-hit/domain/model/bet-hit';

export abstract class BetHitRepository extends Repository<BetHit> {
  abstract findByUserId(userId: string): Promise<BetHit | null>;
  abstract countByTotalHitCountGreaterThan(totalHitCount: number): Promise<number>;
  abstract findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<BetHit>>;
}
