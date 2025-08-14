import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { BetAnswerCreatedEvent } from '~/modules/bet-answer/domain/event/bet-answer-created.event';
import { BetAnswerScorePredictedEvent } from '~/modules/bet-answer/domain/event/bet-answer-score-predicted.event';

export interface BetAnswerPrimitives {
  id: string;
  userId: string;
  sport: Sport;
  predict: {
    matchResult: MatchResult;
    score: {
      kuScore: number;
      yuScore: number;
    } | null;
  };
  scorePredicted: boolean;
  player: {
    kuPlayerId: string | null;
    yuPlayerId: string | null;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type BetAnswerDomainEvent = BetAnswerCreatedEvent | BetAnswerScorePredictedEvent;

export class BetAnswer extends AggregateRoot<BetAnswerPrimitives, BetAnswerDomainEvent> {
  private static readonly SCORE_PREDICTABLE_SPORTS: readonly Sport[] = [
    Sport.FOOTBALL,
    Sport.BASEBALL,
    Sport.ICE_HOCKEY,
  ] as const;

  public static isScorePredictable(sport: Sport): boolean {
    return this.SCORE_PREDICTABLE_SPORTS.includes(sport);
  }

  private _userId: string;
  private _sport: Sport;
  private _predict: {
    matchResult: MatchResult;
    score: {
      kuScore: number;
      yuScore: number;
    } | null;
  };
  private _scorePredicted: boolean;
  private _player: {
    kuPlayerId: string | null;
    yuPlayerId: string | null;
  };

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    userId: string,
    sport: Sport,
    predict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      } | null;
    },
    scorePredicted: boolean,
    player: {
      kuPlayerId: string | null;
      yuPlayerId: string | null;
    }
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._sport = sport;
    this._predict = predict;
    this._scorePredicted = scorePredicted;
    this._player = player;
  }

  public static create(
    id: string,
    userId: string,
    sport: Sport,
    predict:
      | MatchResult
      | {
          kuScore: number;
          yuScore: number;
        },
    player: {
      kuPlayerId: string | null;
      yuPlayerId: string | null;
    }
  ): BetAnswer {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_ANSWER', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('BET_ANSWER', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const finalPredict = this.makeFinalPredict(predict);
    const scorePredicted = finalPredict.score !== null;

    const betAnswer = new BetAnswer(id, now, now, null, userId, sport, finalPredict, scorePredicted, player);
    betAnswer.validateScorePredictableSport();

    betAnswer.addEvent(new BetAnswerCreatedEvent(betAnswer.id, userId, sport, finalPredict, player, now));
    if (finalPredict.score !== null) {
      betAnswer.addEvent(new BetAnswerScorePredictedEvent(betAnswer.id, userId, sport, finalPredict.score, now));
    }

    return betAnswer;
  }

  private static makeFinalPredict(predict: MatchResult | { kuScore: number; yuScore: number }): {
    matchResult: MatchResult;
    score: {
      kuScore: number;
      yuScore: number;
    } | null;
  } {
    let finalPredict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      } | null;
    };
    if (typeof predict === 'object') {
      if (predict.kuScore < 0 || predict.yuScore < 0) {
        throw new DomainException('BET_ANSWER', '점수는 0 이상이어야 합니다', HttpStatus.BAD_REQUEST);
      }

      let matchResult: MatchResult;
      if (predict.kuScore > predict.yuScore) {
        matchResult = MatchResult.KOREA_UNIVERSITY;
      } else if (predict.kuScore < predict.yuScore) {
        matchResult = MatchResult.YONSEI_UNIVERSITY;
      } else {
        matchResult = MatchResult.DRAW;
      }

      finalPredict = {
        matchResult,
        score: predict,
      };
    } else {
      finalPredict = {
        matchResult: predict,
        score: null,
      };
    }

    return finalPredict;
  }

  private validateScorePredictableSport(): void {
    if (this.scorePredicted && !BetAnswer.isScorePredictable(this.sport)) {
      throw new DomainException('BET_ANSWER', `${this.sport} 종목은 점수 예측이 불가능합니다`, HttpStatus.BAD_REQUEST);
    }
  }

  public get userId(): string {
    return this._userId;
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get predict(): {
    matchResult: MatchResult;
    score: {
      kuScore: number;
      yuScore: number;
    } | null;
  } {
    return this._predict;
  }

  public get matchResult(): MatchResult {
    return this._predict.matchResult;
  }

  public get score(): {
    kuScore: number;
    yuScore: number;
  } | null {
    return this._predict.score;
  }

  public get scorePredicted(): boolean {
    return this._scorePredicted;
  }

  public get player(): {
    kuPlayerId: string | null;
    yuPlayerId: string | null;
  } {
    return this._player;
  }

  public get kuPlayerId(): string | null {
    return this._player.kuPlayerId;
  }

  public get yuPlayerId(): string | null {
    return this._player.yuPlayerId;
  }

  public updatePredict(predict: MatchResult | { kuScore: number; yuScore: number }): void {
    const finalPredict = BetAnswer.makeFinalPredict(predict);
    const wasScorePredicted = this._scorePredicted;

    this._predict = finalPredict;
    this.validateScorePredictableSport();
    this.touch();

    if (!wasScorePredicted && finalPredict.score !== null) {
      this._scorePredicted = true;
      this.addEvent(
        new BetAnswerScorePredictedEvent(this.id, this.userId, this.sport, finalPredict.score, this.updatedAt)
      );
    }
  }

  public updatePlayer(player: { kuPlayerId: string | null; yuPlayerId: string | null }): void {
    this._player = player;
    this.touch();
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): BetAnswerPrimitives {
    return {
      id: this.id,
      userId: this._userId,
      sport: this._sport,
      predict: this._predict,
      scorePredicted: this._scorePredicted,
      player: this._player,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: BetAnswerPrimitives): BetAnswer {
    return new BetAnswer(
      primitives.id,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null,
      primitives.userId,
      primitives.sport,
      primitives.predict,
      primitives.scorePredicted,
      primitives.player
    );
  }
}
