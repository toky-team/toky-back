export abstract class DomainEvent {
  abstract readonly eventName: string;

  constructor(
    public readonly aggregateId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}
