import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class MatchResultPredictedEvent extends DomainEvent {
  static readonly eventName = 'bet-answer.match-result-predicted' as const;

  constructor(
    aggregateId: string,
    public userId: string,
    public readonly sport: Sport,
    public readonly matchResult: MatchResult,
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
      matchResult: this.matchResult,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): MatchResultPredictedEvent {
    return new MatchResultPredictedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.matchResult as MatchResult,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
