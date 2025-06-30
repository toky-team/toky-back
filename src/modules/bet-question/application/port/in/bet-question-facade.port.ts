import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionFacade {
  abstract findBySport(sport: Sport): Promise<BetQuestionPrimitives[]>;
  abstract findAll(): Promise<BetQuestionPrimitives[]>;
  abstract updateQuestion(questionId: string, question: string, options: string[]): Promise<BetQuestionPrimitives>;
}
