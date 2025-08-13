import { HttpStatus, Injectable } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

@Injectable()
export class BetQuestionValidateService {
  public validateQuestionsWithSport(sport: Sport, questions: BetQuestion[]): void {
    if (questions.length !== 1) {
      throw new DomainException('BET_QUESTION', '질문은 종목당 하나만 존재해야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (questions.some((q) => q.sport !== sport)) {
      throw new DomainException('BET_QUESTION', '질문은 종목에 맞는 질문이어야 합니다', HttpStatus.BAD_REQUEST);
    }
  }
}
