import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class BetShareCompletedEvent extends DomainEvent {
  public static readonly eventName = 'bet.share.completed' as const;

  constructor(
    aggregateId: string,
    public userId: string,
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
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): BetShareCompletedEvent {
    return new BetShareCompletedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
