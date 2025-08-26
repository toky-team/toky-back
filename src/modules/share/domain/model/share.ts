import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { BetShareCompletedEvent } from '~/modules/share/domain/event/bet-share-completed.event';
import { GameShareCompletedEvent } from '~/modules/share/domain/event/game-share-completed.event';

export interface SharePrimitives {
  id: string;
  userId: string;
  lastBetSharedAt: Dayjs | null;
  lastGameSharedAt: Dayjs | null;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type ShareDomainEvent = BetShareCompletedEvent | GameShareCompletedEvent;

export class Share extends AggregateRoot<SharePrimitives, ShareDomainEvent> {
  private _userId: string;
  private _lastBetSharedAt: Dayjs | null;
  private _lastGameSharedAt: Dayjs | null;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    userId: string,
    lastBetSharedAt: Dayjs | null,
    lastGameSharedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._lastBetSharedAt = lastBetSharedAt;
    this._lastGameSharedAt = lastGameSharedAt;
  }

  public static create(id: string, userId: string): Share {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('SHARE', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('SHARE', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const share = new Share(id, now, now, null, userId, null, null);

    return share;
  }

  public get userId(): string {
    return this._userId;
  }

  public get lastBetSharedAt(): Dayjs | null {
    return this._lastBetSharedAt;
  }

  public get lastGameSharedAt(): Dayjs | null {
    return this._lastGameSharedAt;
  }

  public hasBetSharedToday(): boolean {
    if (this.lastBetSharedAt === null) {
      return false;
    }
    const now = DateUtil.now();

    return this.lastBetSharedAt.isSame(now, 'date');
  }

  public hasGameSharedToday(): boolean {
    if (this.lastGameSharedAt === null) {
      return false;
    }
    const now = DateUtil.now();
    return this.lastGameSharedAt.isSame(now, 'date');
  }

  public betShare(): void {
    if (!this.hasBetSharedToday()) {
      this.addEvent(new BetShareCompletedEvent(this.id, this._userId));
    }

    const now = DateUtil.now();
    this._lastBetSharedAt = now;
    this.touch();
  }

  public gameShare(): void {
    if (!this.hasGameSharedToday()) {
      this.addEvent(new GameShareCompletedEvent(this.id, this._userId));
    }

    const now = DateUtil.now();
    this._lastGameSharedAt = now;
    this.touch();
  }

  public toPrimitives(): SharePrimitives {
    return {
      id: this.id,
      userId: this.userId,
      lastBetSharedAt: this.lastBetSharedAt,
      lastGameSharedAt: this.lastGameSharedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: SharePrimitives): Share {
    return new Share(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.userId,
      primitives.lastBetSharedAt,
      primitives.lastGameSharedAt
    );
  }
}
