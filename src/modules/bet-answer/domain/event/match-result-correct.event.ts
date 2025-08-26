import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class MatchResultCorrectEvent extends DomainEvent {
  static readonly eventName = 'bet_answer.match_result_correct' as const;

  constructor(
    aggregateId: string,
    public userId: string,
    public sport: Sport,
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
      occurredAt: DateUtil.format(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): MatchResultCorrectEvent {
    return new MatchResultCorrectEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
