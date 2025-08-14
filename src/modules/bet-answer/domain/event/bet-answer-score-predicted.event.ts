import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class BetAnswerScorePredictedEvent extends DomainEvent {
  static readonly eventName = 'bet-answer.score-predicted' as const;

  constructor(
    aggregateId: string,
    userId: string,
    public readonly sport: Sport,
    public readonly score: {
      kuScore: number;
      yuScore: number;
    },
    occurredAt?: Dayjs
  ) {
    super(aggregateId, userId, occurredAt);
  }

  toJSON(): Record<string, unknown> {
    return {
      aggregateId: this.aggregateId,
      userId: this.userId,
      sport: this.sport,
      score: this.score,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): BetAnswerScorePredictedEvent {
    return new BetAnswerScorePredictedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.score as {
        kuScore: number;
        yuScore: number;
      },
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined
    );
  }
}
