import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';

export class PlayerCorrectEvent extends DomainEvent {
  static readonly eventName = 'bet_answer.player_correct' as const;

  constructor(
    aggregateId: string,
    public userId: string,
    public sport: Sport,
    public university: University,
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
      university: this.university,
      occurredAt: DateUtil.format(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): PlayerCorrectEvent {
    return new PlayerCorrectEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.university as University,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
