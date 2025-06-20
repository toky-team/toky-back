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
    occurredAt?: Dayjs
  ) {
    super(aggregateId, userId, occurredAt);
  }

  toJSON(): Record<string, unknown> {
    return {
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
      DateUtil.toKst(data.occurredAt as string)
    );
  }
}
