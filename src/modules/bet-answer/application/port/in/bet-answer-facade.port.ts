import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { BetSummaryDto } from '~/modules/bet-answer/application/dto/bet-summary.dto';
import { MatchResultRatioDto } from '~/modules/bet-answer/application/dto/match-result-ratio.dto';
import { BetAnswerPrimitives } from '~/modules/bet-answer/domain/model/bet-answer';

export abstract class BetAnswerFacade {
  abstract createOrUpdateBetAnswer(
    userId: string,
    sport: Sport,
    predict: {
      matchResult?: MatchResult;
      score?: {
        kuScore: number;
        yuScore: number;
      };
    },
    player: {
      kuPlayerId: string | null;
      yuPlayerId: string | null;
    }
  ): Promise<BetAnswerPrimitives>;
  abstract getBetAnswersByUserId(userId: string): Promise<BetAnswerPrimitives[]>;
  abstract getBetAnswerByUserIdAndSport(userId: string, sport: Sport): Promise<BetAnswerPrimitives>;
  abstract getMatchResultRatioBySport(sport: Sport): Promise<MatchResultRatioDto>;
  abstract getBetSummaryByUserId(userId: string): Promise<BetSummaryDto>;
}
