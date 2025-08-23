import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { BetAnswerCreatedEvent } from '~/modules/bet-answer/domain/event/bet-answer-created.event';
import { BetAnswerScorePredictedEvent } from '~/modules/bet-answer/domain/event/bet-answer-score-predicted.event';

export interface BetAnswerPrimitives {
  id: string;
  userId: string;
  sport: Sport;
  // 경기 결과 예측
  predict: {
    matchResult: MatchResult;
    score: {
      kuScore: number;
      yuScore: number;
    } | null;
  } | null;
  // 고대 선수 예측
  kuPlayer: {
    playerId: string | null;
  } | null;
  // 연대 선수 예측
  yuPlayer: {
    playerId: string | null;
  } | null;
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
  } | null;
  private _kuPlayer: {
    playerId: string | null;
  } | null;
  private _yuPlayer: {
    playerId: string | null;
  } | null;

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
    } | null,
    kuPlayer: {
      playerId: string | null;
    } | null,
    yuPlayer: {
      playerId: string | null;
    } | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._sport = sport;
    this._predict = predict;
    this._kuPlayer = kuPlayer;
    this._yuPlayer = yuPlayer;
  }

  public static create(id: string, userId: string, sport: Sport): BetAnswer {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_ANSWER', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('BET_ANSWER', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    const betAnswer = new BetAnswer(id, now, now, null, userId, sport, null, null, null);

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
    if (this.predict === null) {
      return;
    }
    if (this.predict.score === null) {
      return;
    }
    if (!BetAnswer.isScorePredictable(this.sport)) {
      throw new DomainException('BET_ANSWER', '해당 스포츠는 점수 예측이 불가능합니다', HttpStatus.BAD_REQUEST);
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
  } | null {
    return this._predict;
  }

  public get matchResult(): MatchResult | null {
    return this._predict?.matchResult || null;
  }

  public get score(): {
    kuScore: number;
    yuScore: number;
  } | null {
    return this._predict?.score || null;
  }

  public get kuPlayer(): {
    playerId: string | null;
  } | null {
    return this._kuPlayer;
  }

  public get yuPlayer(): {
    playerId: string | null;
  } | null {
    return this._yuPlayer;
  }

  public updatePredict(predict: MatchResult | { kuScore: number; yuScore: number }): void {
    const finalPredict = BetAnswer.makeFinalPredict(predict);
    this._predict = finalPredict;
    this.validateScorePredictableSport();
    this.touch();
  }

  public updatePlayer(university: University, player: { playerId: string | null }): void {
    if (university === University.KOREA_UNIVERSITY) {
      this._kuPlayer = player;
    } else if (university === University.YONSEI_UNIVERSITY) {
      this._yuPlayer = player;
    }
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
      kuPlayer: this._kuPlayer,
      yuPlayer: this._yuPlayer,
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
      primitives.kuPlayer,
      primitives.yuPlayer
    );
  }
}
