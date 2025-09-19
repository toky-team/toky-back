import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionFacade {
  abstract findBySport(sport: Sport): Promise<BetQuestionPrimitives>;
  abstract findAll(): Promise<BetQuestionPrimitives[]>;
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
        playerId: string[];
      };
      yuPlayer: {
        playerId: string[];
      };
    } | null
  ): Promise<BetQuestionPrimitives>;
  abstract isAnswerSet(sport: Sport): Promise<boolean>;
  abstract getAllSetAnswersCount(): Promise<number>;
}
