import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class ChatCreatedEvent extends DomainEvent {
  static readonly eventName = 'chat.created';

  constructor(
    aggregateId: string,
    userId: string,
    public readonly sport: Sport,
    public readonly content: string,
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
      sport: this.sport,
      content: this.content,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): ChatCreatedEvent {
    return new ChatCreatedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.content as string,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
