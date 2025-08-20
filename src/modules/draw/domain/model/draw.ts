import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';

export interface DrawPrimitives {
  id: string;
  userId: string;
  giftId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type DrawDomainEvent = never;

export class Draw extends AggregateRoot<DrawPrimitives, DrawDomainEvent> {
  private _userId: string;
  private _giftId: string;

  private constructor(
    id: string,
    userId: string,
    giftId: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._giftId = giftId;
  }

  public static create(id: string, userId: string, giftId: string): Draw {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('DRAW', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('DRAW', '사용자 ID는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    if (!giftId || giftId.trim().length === 0) {
      throw new DomainException('DRAW', '경품 ID는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    return new Draw(id, userId, giftId, now, now, null);
  }

  public get userId(): string {
    return this._userId;
  }

  public get giftId(): string {
    return this._giftId;
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): DrawPrimitives {
    return {
      id: this.id,
      userId: this._userId,
      giftId: this._giftId,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: DrawPrimitives): Draw {
    return new Draw(
      primitives.id,
      primitives.userId,
      primitives.giftId,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
