import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class PredictAllCorrectEvent extends DomainEvent {
  static readonly eventName = 'bet_answer.predict_all_correct' as const;

  constructor(
    aggregateId: string,
    public userId: string,
    public sport: Sport,
    public hitCount: number,
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
      hitCount: this.hitCount,
      occurredAt: DateUtil.format(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): PredictAllCorrectEvent {
    return new PredictAllCorrectEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.hitCount as number,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
