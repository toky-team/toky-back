import { Dayjs } from 'dayjs';

import { DomainEvent } from '~/libs/core/domain-core/domain-event';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export class BetAnswerCreatedEvent extends DomainEvent {
  static readonly eventName = 'bet-answer.created' as const;

  constructor(
    aggregateId: string,
    userId: string,
    public readonly sport: Sport,
    public readonly predict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      } | null;
    },
    public readonly player: {
      kuPlayerId: string | null;
      yuPlayerId: string | null;
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
      predict: {
        matchResult: this.predict.matchResult,
        score: this.predict.score,
      },
      player: this.player,
      occurredAt: DateUtil.formatDate(this.occurredAt),
    };
  }

  static fromJSON(data: Record<string, unknown>): BetAnswerCreatedEvent {
    return new BetAnswerCreatedEvent(
      data.aggregateId as string,
      data.userId as string,
      data.sport as Sport,
      data.predict as {
        matchResult: MatchResult;
        score: {
          kuScore: number;
          yuScore: number;
        } | null;
      },
      data.player as {
        kuPlayerId: string | null;
        yuPlayerId: string | null;
      },
      data.occurredAt ? DateUtil.toKst(data.occurredAt as string) : undefined
    );
  }
}
