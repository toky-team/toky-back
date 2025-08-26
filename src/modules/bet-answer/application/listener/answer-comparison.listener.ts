import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { BetAnswerFacade } from '~/modules/bet-answer/application/port/in/bet-answer-facade.port';
import { AnswerSetEvent } from '~/modules/bet-question/domain/event/answet-set.event';

@Injectable()
export class AnswerComparisonListener implements OnModuleInit {
  constructor(
    private readonly betAnswerFacade: BetAnswerFacade,

    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    // 정답 등록 시 비교
    await this.eventBus.subscribe(AnswerSetEvent, async (event: AnswerSetEvent) => {
      await this.betAnswerFacade.compareBetAnswer(
        event.sport,
        event.matchResult,
        event.KUScore,
        event.YUScore,
        event.KUPlayerId,
        event.YUPlayerId
      );
    });
  }
}
