import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class TicketGetEvent extends DomainEvent {
  static readonly eventName = 'ticket.get';

  constructor(
    aggregateId: string,
    userId: string,
    public readonly count: number,
    occurredAt?: Dayjs,
    eventId?: string
  ) {
    super(aggregateId, userId, occurredAt, eventId);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      userId: this.userId,
      count: this.count,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): TicketGetEvent {
    return new TicketGetEvent(
      data.aggregateId as string,
      data.userId as string,
      data.count as number,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
