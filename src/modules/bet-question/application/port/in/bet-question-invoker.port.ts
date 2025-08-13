import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionInvoker {
  abstract updateQuestion(
    sport: Sport,
    newQuestion: string,
    newPositionFilter: string | null
  ): Promise<BetQuestionPrimitives>;
}
