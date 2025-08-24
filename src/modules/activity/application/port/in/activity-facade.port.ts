import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ActivityRankDto } from '~/modules/activity/application/dto/activity-rank.dto';

export abstract class ActivityFacade {
  abstract getRanksWithCursor(param: CursorPaginationParam): Promise<PaginatedResult<ActivityRankDto>>;
  abstract getRankByUserId(userId: string): Promise<ActivityRankDto>;
  abstract addScore(userId: string, score: number): Promise<void>;
}
