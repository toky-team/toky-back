import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';

export interface LikePrimitives {
  sport: Sport;
  KULike: number;
  YULike: number;
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

type LikeDomainEvent = never;

export class Like extends AggregateRoot<LikePrimitives, LikeDomainEvent> {
  private _sport: Sport;
  private _KULike: number;
  private _YULike: number;

  private constructor(sport: Sport, KULike: number, YULike: number, createdAt: Dayjs, updatedAt: Dayjs) {
    super(sport, createdAt, updatedAt, null);
    this._sport = sport;
    this._KULike = KULike;
    this._YULike = YULike;
  }

  public static create(sport: Sport): Like {
    const now = DateUtil.now();

    if (!Object.values(Sport).includes(sport)) {
      throw new DomainException('LIKE', '유효하지 않은 스포츠 종목입니다.', HttpStatus.BAD_REQUEST);
    }

    return new Like(sport, 0, 0, now, now);
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get KULike(): number {
    return this._KULike;
  }

  public get YULike(): number {
    return this._YULike;
  }

  public addLikes(university: University, likes: number): void {
    if (likes < 0) {
      throw new DomainException('LIKE', '좋아요 수는 0 이상이어야 합니다.', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(likes)) {
      throw new DomainException('LIKE', '좋아요 수는 정수여야 합니다.', HttpStatus.BAD_REQUEST);
    }

    if (university === University.KOREA_UNIVERSITY) {
      this._KULike += likes;
    } else if (university === University.YONSEI_UNIVERSITY) {
      this._YULike += likes;
    }
    this.touch();
  }

  public reset(): void {
    this._KULike = 0;
    this._YULike = 0;
    this.touch();
  }

  public toPrimitives(): LikePrimitives {
    return {
      sport: this._sport,
      KULike: this._KULike,
      YULike: this._YULike,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static reconstruct(primitives: LikePrimitives): Like {
    return new Like(primitives.sport, primitives.KULike, primitives.YULike, primitives.createdAt, primitives.updatedAt);
  }
}
