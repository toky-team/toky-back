import { DomainEvent } from '~/libs/domain-core/domain-event';

export class UserCreatedEvent extends DomainEvent {
  readonly eventName = 'user.created';

  constructor(
    aggregateId: string,
    readonly name: string,
    readonly phoneNumber: string,
    readonly university: string,
    occurredAt: Date = new Date()
  ) {
    super(aggregateId, occurredAt);
  }
}
