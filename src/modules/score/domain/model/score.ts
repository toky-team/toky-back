import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { ScoreUpdatedEvent } from '~/modules/score/domain/event/score-updated.event';

export interface ScorePrimitives {
  sport: Sport;
  KUScore: number;
  YUScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ScoreDomainEvent = ScoreUpdatedEvent;

export class Score extends AggregateRoot<ScorePrimitives, ScoreDomainEvent> {
  private _sport: Sport;
  private _KUScore: number;
  private _YUScore: number;
  private _isActive: boolean;

  private constructor(
    sport: Sport,
    KUScore: number,
    YUScore: number,
    isActive: boolean,
    createdAt: Dayjs,
    updatedAt: Dayjs
  ) {
    super(sport, createdAt, updatedAt, null);
    this._sport = sport;
    this._KUScore = KUScore;
    this._YUScore = YUScore;
    this._isActive = isActive;
  }

  public static create(sport: Sport): Score {
    const now = DateUtil.now();

    if (!Object.values(Sport).includes(sport)) {
      throw new DomainException('SCORE', '유효하지 않은 스포츠 종목입니다', HttpStatus.BAD_REQUEST);
    }

    return new Score(sport, 0, 0, false, now, now);
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get KUScore(): number {
    return this._KUScore;
  }

  public get YUScore(): number {
    return this._YUScore;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public updateScores(KUScore: number, YUScore: number): void {
    if (!this.isActive) {
      throw new DomainException('SCORE', '활성화 된 경기만 점수를 업데이트 할 수 있습니다', HttpStatus.BAD_REQUEST);
    }

    if (KUScore < 0 || YUScore < 0) {
      throw new DomainException('SCORE', '점수는 음수일 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this._KUScore = KUScore;
    this._YUScore = YUScore;
    this.touch();
  }

  public reset(): void {
    if (this.isActive) {
      throw new DomainException('SCORE', '비활성화 된 경기만 점수를 초기화 할 수 있습니다', HttpStatus.BAD_REQUEST);
    }

    this._KUScore = 0;
    this._YUScore = 0;
    this.touch();
  }

  public activate(): void {
    if (this.isActive) {
      throw new DomainException('SCORE', '경기가 이미 활성화 되어 있습니다', HttpStatus.BAD_REQUEST);
    }

    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('SCORE', '경기가 이미 비활성화 되어 있습니다', HttpStatus.BAD_REQUEST);
    }

    this._isActive = false;
    this.touch();
  }

  public toPrimitives(): ScorePrimitives {
    return {
      sport: this.sport,
      KUScore: this.KUScore,
      YUScore: this.YUScore,
      isActive: this.isActive,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
    };
  }

  public static reconstruct(primitives: ScorePrimitives): Score {
    return new Score(
      primitives.sport,
      primitives.KUScore,
      primitives.YUScore,
      primitives.isActive,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt)
    );
  }
}
