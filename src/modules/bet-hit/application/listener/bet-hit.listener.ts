import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { MatchResultCorrectEvent } from '~/modules/bet-answer/domain/event/match-result-correct.event';
import { PlayerCorrectEvent } from '~/modules/bet-answer/domain/event/player-correct.event';
import { ScoreCorrectEvent } from '~/modules/bet-answer/domain/event/score-correct.event';
import { BetHitFacade } from '~/modules/bet-hit/application/port/in/bet-hit-facade.port';
import { AnswerRemovedEvent } from '~/modules/bet-question/domain/event/answer-removed.event';

@Injectable()
export class BetHitListener implements OnModuleInit {
  constructor(
    private readonly betHitFacade: BetHitFacade,

    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.subscribe(MatchResultCorrectEvent, async (event: MatchResultCorrectEvent) => {
      await this.betHitFacade.addMatchResultHit(event.userId, event.sport);
    });
    await this.eventBus.subscribe(ScoreCorrectEvent, async (event: ScoreCorrectEvent) => {
      await this.betHitFacade.addScoreHit(event.userId, event.sport);
    });
    await this.eventBus.subscribe(PlayerCorrectEvent, async (event: PlayerCorrectEvent) => {
      await this.betHitFacade.addPlayerHit(event.userId, event.sport, event.university);
    });
    await this.eventBus.subscribe(AnswerRemovedEvent, async (event: AnswerRemovedEvent) => {
      await this.betHitFacade.revertAllHits(event.sport);
    });
  }
}
