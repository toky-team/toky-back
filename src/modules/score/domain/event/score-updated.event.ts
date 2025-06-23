import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class ScoreUpdatedEvent extends DomainEvent {
  static readonly eventName = 'score.updated';

  constructor(
    public readonly sport: Sport,
    public readonly KUScore: number,
    public readonly YUScore: number,
    occurredAt?: Dayjs
  ) {
    super(sport, undefined, occurredAt);
  }

  toJSON(): Record<string, unknown> {
    return {
      sport: this.sport,
      KUScore: this.KUScore,
      YUScore: this.YUScore,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): ScoreUpdatedEvent {
    return new ScoreUpdatedEvent(
      data.sport as Sport,
      data.KUScore as number,
      data.YUScore as number,
      DateUtil.toKst(data.occurredAt as string)
    );
  }
}
