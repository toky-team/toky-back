import { DomainEvent, EventConstructor } from '~/libs/core/domain-core/domain-event';

export abstract class EventBus {
  abstract emit<E extends DomainEvent>(event: E): Promise<void>;

  abstract subscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void>;

  abstract unsubscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void>;
}
