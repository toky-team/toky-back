import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';

export interface PlayerLikePrimitives {
  id: string;
  userId: string;
  playerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type PlayerLikeDomainEvent = never;

export class PlayerLike extends AggregateRoot<PlayerLikePrimitives, PlayerLikeDomainEvent> {
  private _userId: string;
  private _playerId: string;

  private constructor(
    id: string,
    userId: string,
    playerId: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._playerId = playerId;
  }

  public static create(id: string, userId: string, playerId: string): PlayerLike {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('PLAYER_LIKE', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('PLAYER_LIKE', '사용자 ID는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    if (!playerId || playerId.trim().length === 0) {
      throw new DomainException('PLAYER_LIKE', '플레이어 ID는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    return new PlayerLike(id, userId, playerId, now, now, null);
  }

  public get userId(): string {
    return this._userId;
  }

  public get playerId(): string {
    return this._playerId;
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): PlayerLikePrimitives {
    return {
      id: this.id,
      userId: this._userId,
      playerId: this._playerId,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: PlayerLikePrimitives): PlayerLike {
    return new PlayerLike(
      primitives.id,
      primitives.userId,
      primitives.playerId,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
