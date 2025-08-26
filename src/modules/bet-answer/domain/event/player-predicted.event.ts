import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';

export class PlayerPredictedEvent extends DomainEvent {
  static readonly eventName = 'bet-answer.player-predicted' as const;

  constructor(
    aggregateId: string,
    public userId: string,
    public sport: Sport,
    public university: University,
    public readonly playerId: string | null,
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
      playerId: this.playerId,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): PlayerPredictedEvent {
    return new PlayerPredictedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.university as University,
      data.playerId as string | null,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
