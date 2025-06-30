import { HttpStatus, Injectable } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

@Injectable()
export class BetQuestionValidateService {
  public validateQuestionsWithSport(sport: Sport, questions: BetQuestion[]): void {
    // 개수 검증
    if (questions.length !== 5) {
      throw new DomainException('BET_QUESTION', '질문은 정확히 5개여야 합니다', HttpStatus.BAD_REQUEST);
    }

    // 종목 검증
    if (questions.some((q) => q.sport !== sport)) {
      throw new DomainException('BET_QUESTION', '모든 질문은 동일한 종목이어야 합니다', HttpStatus.BAD_REQUEST);
    }

    // 순서 검증
    const orders = questions.map((q) => q.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== 5) {
      throw new DomainException('BET_QUESTION', '질문 순서는 중복될 수 없습니다.', HttpStatus.BAD_REQUEST);
    }
    const expectedOrders = [1, 2, 3, 4, 5];
    if (!expectedOrders.every((order) => uniqueOrders.has(order))) {
      throw new DomainException('BET_QUESTION', '질문 순서는 1-5까지의 연속된 값이어야 합니다', HttpStatus.BAD_REQUEST);
    }
  }
}
