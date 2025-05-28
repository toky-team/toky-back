import { DomainEntity } from '~/libs/domain-core/domain-entity';
import { DomainEvent } from '~/libs/domain-core/domain-event';

export abstract class AggregateRoot<
  TPrimitives,
  TEvent extends DomainEvent = DomainEvent,
> extends DomainEntity<TPrimitives> {
  private domainEvents: TEvent[] = [];

  protected addEvent(event: TEvent): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): TEvent[] {
    const events = this.domainEvents;
    this.domainEvents = [];
    return events;
  }
}
