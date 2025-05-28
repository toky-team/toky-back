import { AggregateRoot } from '~/libs/domain-core/aggregate-root';
import { DomainEvent } from '~/libs/domain-core/domain-event';

export abstract class Repository<
  T extends AggregateRoot<TPrimitives, TEvent>,
  TPrimitives = unknown,
  TEvent extends DomainEvent = DomainEvent,
> {
  abstract save(aggregate: T): Promise<void>;
  abstract saveAll(aggregates: T[]): Promise<void>;
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
}
