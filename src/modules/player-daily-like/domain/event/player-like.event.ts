import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class PlayerLikeEvent extends DomainEvent {
  static readonly eventName = 'player.like' as const;

  constructor(
    aggregateId: string,
    public userId: string,
    public likeCount: number,
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
      likeCount: this.likeCount,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): PlayerLikeEvent {
    return new PlayerLikeEvent(
      data.aggregateId as string,
      data.userId as string,
      data.likeCount as number,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
