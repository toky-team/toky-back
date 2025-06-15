import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { TicketGetEvent } from '~/modules/ticket/domain/event/ticket-get.event';
import { TicketUsedEvent } from '~/modules/ticket/domain/event/ticket-used.event';

export interface TicketCountPrimitives {
  id: string;
  count: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type TicketDomainEvent = TicketGetEvent | TicketUsedEvent;

export class TicketCount extends AggregateRoot<TicketCountPrimitives, TicketDomainEvent> {
  private _count: number;
  private _userId: string;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    count: number,
    userId: string
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._count = count;
    this._userId = userId;
  }

  public static create(id: string, count: number, userId: string): TicketCount {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('TICKET', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (count < 0) {
      throw new DomainException('TICKET', '티켓 카운트는 음수일 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(count)) {
      throw new DomainException('TICKET', '티켓 카운트는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (!userId || userId.trim().length === 0) {
      throw new DomainException('TICKET', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    return new TicketCount(id, now, now, null, count, userId);
  }

  public get count(): number {
    return this._count;
  }

  public get userId(): string {
    return this._userId;
  }

  public useTickets(count: number): void {
    if (count <= 0) {
      throw new DomainException('TICKET', '사용할 티켓 수는 1 이상이어야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(count)) {
      throw new DomainException('TICKET', '사용할 티켓 수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (this._count < count) {
      throw new DomainException('TICKET', '티켓 수가 부족합니다', HttpStatus.BAD_REQUEST);
    }

    this._count -= count;

    this.touch();

    this.addEvent(new TicketUsedEvent(this.id, this.userId, count, this.updatedAt));
  }

  public getTickets(count: number): void {
    if (count <= 0) {
      throw new DomainException('TICKET', '획득한 티켓 수는 1 이상이어야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(count)) {
      throw new DomainException('TICKET', '획득한 티켓 수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    this._count += count;

    this.touch();

    this.addEvent(new TicketGetEvent(this.id, this.userId, count, this.updatedAt));
  }

  public toPrimitives(): TicketCountPrimitives {
    return {
      id: this.id,
      count: this.count,
      userId: this.userId,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: TicketCountPrimitives): TicketCount {
    return new TicketCount(
      primitives.id,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null,
      primitives.count,
      primitives.userId
    );
  }
}
