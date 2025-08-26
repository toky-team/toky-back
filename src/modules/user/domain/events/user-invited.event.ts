import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class UserInvitedEvent extends DomainEvent {
  static readonly eventName = 'user.invited' as const;

  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly invitedBy: string,
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
      invitedBy: this.invitedBy,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): UserInvitedEvent {
    return new UserInvitedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.invitedBy as string,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
