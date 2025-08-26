import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class GameShareCompletedEvent extends DomainEvent {
  public static readonly eventName = 'game.share.completed' as const;

  constructor(aggregateId: string, userId: string, occurredAt?: Dayjs, eventId?: string) {
    super(aggregateId, userId, occurredAt, eventId);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      userId: this.userId,
      occurredAt: DateUtil.format(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): GameShareCompletedEvent {
    return new GameShareCompletedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
