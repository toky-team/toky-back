import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export abstract class BetQuestionInvoker {
  abstract updateQuestion(questionId: string, question: string, options: string[]): Promise<BetQuestionPrimitives>;
}
