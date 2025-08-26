import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export class AuthRegisteredEvent extends DomainEvent {
  static readonly eventName = 'auth.registered' as const;

  constructor(
    aggregateId: string,
    userId: string,
    public readonly providerType: ProviderType,
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
      providerType: this.providerType,
      occurredAt: DateUtil.format(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): AuthRegisteredEvent {
    return new AuthRegisteredEvent(
      data.aggregateId as string,
      data.userId as string,
      data.providerType as ProviderType,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
