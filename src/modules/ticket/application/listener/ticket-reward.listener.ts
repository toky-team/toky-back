import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { BetAnswerCreatedEvent } from '~/modules/bet-answer/domain/event/bet-answer-created.event';
import { BetAnswerScorePredictedEvent } from '~/modules/bet-answer/domain/event/bet-answer-score-predicted.event';
import { ChatCreatedEvent } from '~/modules/chat/domain/event/chat-created.event';
import { TicketFacade } from '~/modules/ticket/application/port/in/ticket-facade.port';
import { TicketRewardPolicy } from '~/modules/ticket/application/service/ticket-reward-policy';
import { UserCreatedEvent } from '~/modules/user/domain/events/user-created.event';
import { UserInvitedEvent } from '~/modules/user/domain/events/user-invited.event';

@Injectable()
export class TicketRewardlistener implements OnModuleInit {
  constructor(
    private readonly ticketFacade: TicketFacade,
    private readonly ticketRewardPolicy: TicketRewardPolicy,

    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.subscribe(UserCreatedEvent, async (event: UserCreatedEvent) => {
      await this.handleEvent(event);
    });
    await this.eventBus.subscribe(ChatCreatedEvent, async (event: ChatCreatedEvent) => {
      await this.handleEvent(event);
    });
    // 초대 이벤트는 두 유저 모두 티켓을 받도록 처리
    await this.eventBus.subscribe(UserInvitedEvent, async (event: UserInvitedEvent) => {
      const { userId, invitedBy } = event;
      const { amount, reason } = this.ticketRewardPolicy.getPolicy(event.eventName);
      await this.ticketFacade.incrementTicketCount(userId, amount, reason);
      await this.ticketFacade.incrementTicketCount(invitedBy, amount, reason);
      return Promise.resolve();
    });
    await this.eventBus.subscribe(BetAnswerCreatedEvent, async (event: BetAnswerCreatedEvent) => {
      await this.handleEvent(event);
    });
    await this.eventBus.subscribe(BetAnswerScorePredictedEvent, async (event: BetAnswerScorePredictedEvent) => {
      await this.handleEvent(event);
    });
  }

  private async handleEvent<E extends DomainEvent>(event: E): Promise<void> {
    const { userId } = event;
    if (!userId) {
      return Promise.resolve();
    }
    const { amount, reason } = this.ticketRewardPolicy.getPolicy(event.eventName);
    return this.ticketFacade.incrementTicketCount(userId, amount, reason);
  }
}
