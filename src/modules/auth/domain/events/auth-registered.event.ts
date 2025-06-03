import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export class AuthRegisteredEvent extends DomainEvent {
  readonly eventName = 'auth.registered';

  constructor(
    aggregateId: string,
    readonly userId: string,
    readonly providerType: ProviderType,
    occurredAt: Dayjs = DateUtil.now()
  ) {
    super(aggregateId, occurredAt);
  }
}
