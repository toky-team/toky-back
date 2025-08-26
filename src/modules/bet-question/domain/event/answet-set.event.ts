import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class AnswerSetEvent extends DomainEvent {
  static readonly eventName = 'bet_question.answer_set';

  constructor(
    aggregateId: string,
    public readonly sport: Sport,
    public readonly matchResult: MatchResult,
    public readonly KUScore: number,
    public readonly YUScore: number,
    public readonly KUPlayerId: string | null,
    public readonly YUPlayerId: string | null,
    occurredAt?: Dayjs,
    eventId?: string
  ) {
    super(aggregateId, undefined, occurredAt, eventId);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      sport: this.sport,
      matchResult: this.matchResult,
      KUScore: this.KUScore,
      YUScore: this.YUScore,
      KUPlayerId: this.KUPlayerId,
      YUPlayerId: this.YUPlayerId,
      occurredAt: DateUtil.format(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): AnswerSetEvent {
    return new AnswerSetEvent(
      data.aggregateId as string,
      data.sport as Sport,
      data.matchResult as MatchResult,
      data.KUScore as number,
      data.YUScore as number,
      data.KUPlayerId as string | null,
      data.YUPlayerId as string | null,
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined,
      data.eventId as string
    );
  }
}
