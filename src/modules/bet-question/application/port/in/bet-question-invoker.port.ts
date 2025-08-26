import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionInvoker {
  abstract updateQuestion(
    sport: Sport,
    newQuestion: string,
    newPositionFilter: string | null
  ): Promise<BetQuestionPrimitives>;
  abstract setAnswer(
    sport: Sport,
    answer: {
      predict: {
        matchResult: MatchResult;
        score: {
          kuScore: number;
          yuScore: number;
        };
      };
      kuPlayer: {
        playerId: string | null;
      };
      yuPlayer: {
        playerId: string | null;
      };
    } | null
  ): Promise<BetQuestionPrimitives>;
  abstract isAnswerSet(sport: Sport): Promise<boolean>;
}
