import { Repository } from '~/libs/core/application-core/repository.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { Activity } from '~/modules/activity/domain/module/activity';

export abstract class ActivityRepository extends Repository<Activity> {
  abstract findByUserId(userId: string): Promise<Activity | null>;
  abstract countByScoreGreaterThan(score: number): Promise<number>;
  abstract findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<Activity>>;
}
