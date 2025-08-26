import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DateUtil } from '~/libs/utils/date.util';
import { PlayerLikeEvent } from '~/modules/player-daily-like/domain/event/player-like.event';

export interface PlayerDailyLikePrimitives {
  id: string;
  userId: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type PlayerDailyLikeEvent = PlayerLikeEvent;

export class PlayerDailyLike extends AggregateRoot<PlayerDailyLikePrimitives, PlayerDailyLikeEvent> {
  private static readonly DAILY_LIMIT = 10;

  private _userId: string;
  private _likeCount: number;

  private constructor(
    id: string,
    userId: string,
    likeCount: number,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._likeCount = likeCount;
  }

  public static create(id: string, userId: string): PlayerDailyLike {
    const now = DateUtil.now();
    return new PlayerDailyLike(id, userId, 0, now, now, null);
  }

  public get userId(): string {
    return this._userId;
  }

  public get likeCount(): number {
    return this._likeCount;
  }

  public incrementLikeCount(count: number): void {
    const newLikeCount = Math.min(this._likeCount + count, PlayerDailyLike.DAILY_LIMIT);
    const increment = newLikeCount - this._likeCount;
    if (increment > 0) {
      this.addEvent(new PlayerLikeEvent(this.id, this._userId, increment));
    }
    this._likeCount = newLikeCount;
    this.touch();
  }

  public isToday(): boolean {
    const now = DateUtil.now();
    return now.isSame(this.createdAt, 'date');
  }

  toPrimitives(): PlayerDailyLikePrimitives {
    return {
      id: this.id,
      userId: this._userId,
      likeCount: this._likeCount,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: PlayerDailyLikePrimitives): PlayerDailyLike {
    return new PlayerDailyLike(
      primitives.id,
      primitives.userId,
      primitives.likeCount,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
