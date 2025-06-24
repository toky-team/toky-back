import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { ScoreUpdatedEvent } from '~/modules/score/domain/event/score-updated.event';
import { MatchStatus, MatchStatusVO } from '~/modules/score/domain/model/match-status.vo';

export interface ScorePrimitives {
  sport: Sport;
  KUScore: number;
  YUScore: number;
  matchStatus: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

type ScoreDomainEvent = ScoreUpdatedEvent;

export class Score extends AggregateRoot<ScorePrimitives, ScoreDomainEvent> {
  private _sport: Sport;
  private _KUScore: number;
  private _YUScore: number;
  private _matchStatus: MatchStatusVO;

  private constructor(
    sport: Sport,
    KUScore: number,
    YUScore: number,
    matchStatus: MatchStatusVO,
    createdAt: Dayjs,
    updatedAt: Dayjs
  ) {
    super(sport, createdAt, updatedAt, null);
    this._sport = sport;
    this._KUScore = KUScore;
    this._YUScore = YUScore;
    this._matchStatus = matchStatus;
  }

  public static create(sport: Sport): Score {
    const now = DateUtil.now();

    if (!Object.values(Sport).includes(sport)) {
      throw new DomainException('SCORE', '유효하지 않은 스포츠 종목입니다', HttpStatus.BAD_REQUEST);
    }

    return new Score(sport, 0, 0, MatchStatusVO.create(MatchStatus.NOT_STARTED), now, now);
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

  public get matchStatus(): MatchStatusVO {
    return this._matchStatus;
  }

  public updateScores(KUScore: number, YUScore: number): void {
    if (!this.matchStatus.isInProgress()) {
      throw new DomainException('SCORE', '활성화 된 경기만 점수를 업데이트 할 수 있습니다', HttpStatus.BAD_REQUEST);
    }

    if (KUScore < 0 || YUScore < 0) {
      throw new DomainException('SCORE', '점수는 음수일 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(KUScore) || !Number.isInteger(YUScore)) {
      throw new DomainException('SCORE', '점수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    this._KUScore = KUScore;
    this._YUScore = YUScore;
    this.touch();
  }

  public reset(): void {
    this.matchStatus.matchReset();

    this._KUScore = 0;
    this._YUScore = 0;
    this.touch();
  }

  public activate(): void {
    this.matchStatus.matchStart();
    this.touch();
  }

  public deactivate(): void {
    this.matchStatus.matchComplete();
    this.touch();
  }

  public toPrimitives(): ScorePrimitives {
    return {
      sport: this.sport,
      KUScore: this.KUScore,
      YUScore: this.YUScore,
      matchStatus: this.matchStatus.value,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
    };
  }

  public static reconstruct(primitives: ScorePrimitives): Score {
    const matchStatusVO = MatchStatusVO.create(primitives.matchStatus);

    return new Score(
      primitives.sport,
      primitives.KUScore,
      primitives.YUScore,
      matchStatusVO,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt)
    );
  }
}
