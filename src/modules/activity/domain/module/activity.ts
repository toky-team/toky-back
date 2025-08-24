import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';

export interface ActivityPrimitives {
  id: string;
  userId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type ActivityDomainEvent = never;

export class Activity extends AggregateRoot<ActivityPrimitives, ActivityDomainEvent> {
  private _userId: string;
  private _score: number;

  private constructor(
    id: string,
    userId: string,
    score: number,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._score = score;
  }

  public static create(id: string, userId: string, score: number): Activity {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('ACTIVITY', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (score < 0) {
      throw new DomainException('ACTIVITY', '점수는 음수일 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('ACTIVITY', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    return new Activity(id, userId, score, now, now, null);
  }

  public get userId(): string {
    return this._userId;
  }

  public get score(): number {
    return this._score;
  }

  public addScore(score: number): void {
    if (score < 0) {
      throw new DomainException('ACTIVITY', '점수는 음수일 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    this._score += score;
    this.touch();
  }

  public toPrimitives(): ActivityPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      score: this.score,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: ActivityPrimitives): Activity {
    return new Activity(
      primitives.id,
      primitives.userId,
      primitives.score,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
