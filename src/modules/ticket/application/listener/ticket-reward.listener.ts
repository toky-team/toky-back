import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { ChatCreatedEvent } from '~/modules/chat/domain/event/chat-created.event';
import { TicketFacade } from '~/modules/ticket/application/port/in/ticket-facade.port';
import { TicketRewardPolicy } from '~/modules/ticket/application/service/ticket-reward-policy';

@Injectable()
export class TicketRewardlistener implements OnModuleInit {
  constructor(
    private readonly ticketFacade: TicketFacade,
    private readonly ticketRewardPolicy: TicketRewardPolicy,

    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.subscribe(ChatCreatedEvent, async (event: ChatCreatedEvent) => {
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
