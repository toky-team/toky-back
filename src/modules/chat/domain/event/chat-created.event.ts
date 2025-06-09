import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class ChatCreatedEvent extends DomainEvent {
  readonly eventName = 'chat.created';

  constructor(
    aggregateId: string,
    readonly content: string,
    readonly userId: string,
    occurredAt: Dayjs = DateUtil.now()
  ) {
    super(aggregateId, occurredAt);
  }
}
