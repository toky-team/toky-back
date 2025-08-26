import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';

export class UserCreatedEvent extends DomainEvent {
  static readonly eventName = 'user.created' as const;

  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly phoneNumber: string,
    public readonly university: University,
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
      username: this.username,
      phoneNumber: this.phoneNumber,
      university: this.university,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): UserCreatedEvent {
    return new UserCreatedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.username as string,
      data.phoneNumber as string,
      data.university as University,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
