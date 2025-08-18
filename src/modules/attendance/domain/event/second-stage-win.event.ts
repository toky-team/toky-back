import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { DateUtil } from '~/libs/utils/date.util';

export class SecondStageWinEvent extends DomainEvent {
  static readonly eventName = 'attendance.second-stage-win' as const;

  constructor(aggregateId: string, userId: string, occuredAt?: Dayjs) {
    super(aggregateId, userId, occuredAt);
  }

  toJSON(): Record<string, unknown> {
    return {
      aggregateId: this.aggregateId,
      userId: this.userId,
      occuredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(date: Record<string, unknown>): SecondStageWinEvent {
    return new SecondStageWinEvent(
      date.aggregateId as string,
      date.userId as string,
      date.occuredAt ? DateUtil.toKst(date.occuredAt as string) : undefined
    );
  }
}
