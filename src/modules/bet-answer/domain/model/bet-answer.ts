import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchResult } from '~/libs/enums/match-result';
import { SCORE_PREDICTABLE_SPORTS, Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { MatchResultCorrectEvent } from '~/modules/bet-answer/domain/event/match-result-correct.event';
import { MatchResultPredictedEvent } from '~/modules/bet-answer/domain/event/match-result-predicted.event';
import { PlayerCorrectEvent } from '~/modules/bet-answer/domain/event/player-correct.event';
import { PlayerPredictedEvent } from '~/modules/bet-answer/domain/event/player-predicted.event';
import { PredictAllCorrectEvent } from '~/modules/bet-answer/domain/event/predict-all-correct.event';
import { ScoreCorrectEvent } from '~/modules/bet-answer/domain/event/score-correct.event';
import { ScorePredictedEvent } from '~/modules/bet-answer/domain/event/score-predicted.event';

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
  // 점수 예측이 한 번이라도 이루어졌는지 추적
  hasEverPredictedScore: boolean;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type BetAnswerDomainEvent =
  | MatchResultPredictedEvent
  | ScorePredictedEvent
  | PlayerPredictedEvent
  | MatchResultCorrectEvent
  | ScoreCorrectEvent
  | PlayerCorrectEvent;

export class BetAnswer extends AggregateRoot<BetAnswerPrimitives, BetAnswerDomainEvent> {
  public static isScorePredictable(sport: Sport): boolean {
    return SCORE_PREDICTABLE_SPORTS.includes(sport);
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
  private _hasEverPredictedScore: boolean;

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
    } | null,
    hasEverPredictedScore: boolean
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._sport = sport;
    this._predict = predict;
    this._kuPlayer = kuPlayer;
    this._yuPlayer = yuPlayer;
    this._hasEverPredictedScore = hasEverPredictedScore;
  }

  public static create(id: string, userId: string, sport: Sport): BetAnswer {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_ANSWER', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('BET_ANSWER', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    const betAnswer = new BetAnswer(id, now, now, null, userId, sport, null, null, null, false);

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

  public get hasEverPredictedScore(): boolean {
    return this._hasEverPredictedScore;
  }

  public updatePredict(predict: MatchResult | { kuScore: number; yuScore: number }): void {
    const finalPredict = BetAnswer.makeFinalPredict(predict);

    if (this.predict === null) {
      this.addEvent(new MatchResultPredictedEvent(this.id, this.userId, this.sport, finalPredict.matchResult));
    }
    if (finalPredict.score !== null) {
      if (!this._hasEverPredictedScore) {
        this.addEvent(new ScorePredictedEvent(this.id, this.userId, this.sport, finalPredict.score));
        this._hasEverPredictedScore = true;
      }
    }

    this._predict = finalPredict;
    this.validateScorePredictableSport();
    this.touch();
  }

  public updatePlayer(university: University, player: { playerId: string | null }): void {
    if (university === University.KOREA_UNIVERSITY) {
      if (this.kuPlayer === null) {
        this.addEvent(new PlayerPredictedEvent(this.id, this.userId, this.sport, university, player.playerId));
      }
      this._kuPlayer = player;
    } else if (university === University.YONSEI_UNIVERSITY) {
      if (this.yuPlayer === null) {
        this.addEvent(new PlayerPredictedEvent(this.id, this.userId, this.sport, university, player.playerId));
      }
      this._yuPlayer = player;
    }
    this.touch();
  }

  public compareAnswer(
    matchResult: MatchResult,
    kuScore: number,
    yuScore: number,
    kuPlayerId: string[],
    yuPlayerId: string[]
  ): void {
    const betHit = {
      matchResultHit: false,
      scoreHit: false,
      kuPlayerHit: false,
      yuPlayerHit: false,
    };
    let hitCount = 0;
    if (this.predict !== null) {
      if (this.predict.matchResult === matchResult) {
        betHit.matchResultHit = true;
        hitCount++;
        this.addEvent(new MatchResultCorrectEvent(this.id, this.userId, this.sport));
      }
      if (this.predict.score !== null) {
        if (this.predict.score.kuScore === kuScore && this.predict.score.yuScore === yuScore) {
          betHit.scoreHit = true;
          hitCount++;
          this.addEvent(new ScoreCorrectEvent(this.id, this.userId, this.sport));
        }
      }
    }
    if (this.kuPlayer !== null) {
      if (this.kuPlayer.playerId !== null && kuPlayerId.includes(this.kuPlayer.playerId)) {
        betHit.kuPlayerHit = true;
        hitCount++;
        this.addEvent(new PlayerCorrectEvent(this.id, this.userId, this.sport, University.KOREA_UNIVERSITY));
      } else if (this.kuPlayer.playerId === null && kuPlayerId.length === 0) {
        betHit.kuPlayerHit = true;
        hitCount++;
        this.addEvent(new PlayerCorrectEvent(this.id, this.userId, this.sport, University.KOREA_UNIVERSITY));
      }
    }
    if (this.yuPlayer !== null) {
      if (this.yuPlayer.playerId !== null && yuPlayerId.includes(this.yuPlayer.playerId)) {
        betHit.yuPlayerHit = true;
        hitCount++;
        this.addEvent(new PlayerCorrectEvent(this.id, this.userId, this.sport, University.YONSEI_UNIVERSITY));
      } else if (this.yuPlayer.playerId === null && yuPlayerId.length === 0) {
        betHit.yuPlayerHit = true;
        hitCount++;
        this.addEvent(new PlayerCorrectEvent(this.id, this.userId, this.sport, University.YONSEI_UNIVERSITY));
      }
    }
    if (betHit.matchResultHit && betHit.kuPlayerHit && betHit.yuPlayerHit) {
      this.addEvent(new PredictAllCorrectEvent(this.id, this.userId, this.sport, hitCount));
    }
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
      hasEverPredictedScore: this._hasEverPredictedScore,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: BetAnswerPrimitives): BetAnswer {
    return new BetAnswer(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.userId,
      primitives.sport,
      primitives.predict,
      primitives.kuPlayer,
      primitives.yuPlayer,
      primitives.hasEverPredictedScore
    );
  }
}
