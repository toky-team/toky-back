import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class UserCreatedEvent extends DomainEvent {
  readonly eventName = 'user.created';

  constructor(
    aggregateId: string,
    readonly name: string,
    readonly phoneNumber: string,
    readonly university: string,
    occurredAt: Dayjs = DateUtil.now()
  ) {
    super(aggregateId, occurredAt);
  }
}
