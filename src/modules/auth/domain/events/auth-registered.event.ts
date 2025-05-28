import { DomainEvent } from '~/libs/domain-core/domain-event';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export class AuthRegisteredEvent extends DomainEvent {
  readonly eventName = 'auth.registered';

  constructor(
    aggregateId: string,
    readonly userId: string,
    readonly providerType: ProviderType,
    occurredAt: Date = new Date()
  ) {
    super(aggregateId, occurredAt);
  }
}
