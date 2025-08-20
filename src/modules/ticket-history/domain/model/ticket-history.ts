import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';

export interface TicketHistoryPrimitives {
  id: string;
  userId: string;
  reason: string;
  changeAmount: number;
  resultAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type TicketHistoryDomainEvent = never;

export class TicketHistory extends AggregateRoot<TicketHistoryPrimitives, TicketHistoryDomainEvent> {
  private _userId: string;
  private _reason: string;
  private _changeAmount: number;
  private _resultAmount: number;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    userId: string,
    reason: string,
    changeAmount: number,
    resultAmount: number
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._reason = reason;
    this._changeAmount = changeAmount;
    this._resultAmount = resultAmount;
  }

  public static create(
    id: string,
    userId: string,
    reason: string,
    changeAmount: number,
    resultAmount: number
  ): TicketHistory {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('TICKET-HISTORY', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('TICKET-HISTORY', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (changeAmount === 0) {
      throw new DomainException('TICKET-HISTORY', '변화량은 0 일 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(changeAmount)) {
      throw new DomainException('TICKET-HISTORY', '변화량은 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (resultAmount < 0) {
      throw new DomainException('TICKET-HISTORY', '결과량은 음수일 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(resultAmount)) {
      throw new DomainException('TICKET-HISTORY', '결과량은 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (!reason || reason.trim().length === 0) {
      throw new DomainException('TICKET-HISTORY', '이유는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    return new TicketHistory(id, now, now, null, userId, reason, changeAmount, resultAmount);
  }

  public get userId(): string {
    return this._userId;
  }

  public get reason(): string {
    return this._reason;
  }

  public get changeAmount(): number {
    return this._changeAmount;
  }

  public get resultAmount(): number {
    return this._resultAmount;
  }

  public toPrimitives(): TicketHistoryPrimitives {
    return {
      id: this.id,
      userId: this._userId,
      reason: this._reason,
      changeAmount: this._changeAmount,
      resultAmount: this._resultAmount,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: TicketHistoryPrimitives): TicketHistory {
    return new TicketHistory(
      primitives.id,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null,
      primitives.userId,
      primitives.reason,
      primitives.changeAmount,
      primitives.resultAmount
    );
  }
}
