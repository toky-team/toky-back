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
}
