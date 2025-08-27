import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { BetHitRankDto } from '~/modules/bet-hit/application/dto/bet-hit-rank.dto';

export abstract class BetHitFacade {
  abstract getRanksWithCursor(param: CursorPaginationParam): Promise<PaginatedResult<BetHitRankDto>>;
  abstract getRankByUserId(userId: string): Promise<BetHitRankDto>;
  abstract addMatchResultHit(userId: string, sport: Sport): Promise<void>;
  abstract addScoreHit(userId: string, sport: Sport): Promise<void>;
  abstract addPlayerHit(userId: string, sport: Sport, university: University): Promise<void>;
  abstract revertAllHits(sport: Sport): Promise<void>;
}
