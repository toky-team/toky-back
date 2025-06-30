import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export interface BetQuestionPrimitives {
  id: string;
  sport: Sport;
  order: number; // 질문 순서 (1-5)
  question: string; // 질문 내용
  options: string[]; // 선택지 배열 (2-3개)
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type BetQuestionDomainEvent = never;

export class BetQuestion extends AggregateRoot<BetQuestionPrimitives, BetQuestionDomainEvent> {
  private _sport: Sport;
  private _order: number;
  private _question: string;
  private _options: string[];

  private constructor(
    id: string,
    sport: Sport,
    order: number,
    question: string,
    options: string[],
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._sport = sport;
    this._order = order;
    this._question = question;
    this._options = [...options];
  }

  static create(id: string, sport: Sport, order: number, question: string, options: string[]): BetQuestion {
    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_QUESTION', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (order < 1 || order > 5) {
      throw new DomainException('BET_QUESTION', '질문 순서는 1-5 사이여야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(order)) {
      throw new DomainException('BET_QUESTION', '질문 순서는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (options.length < 2 || options.length > 3) {
      throw new DomainException('BET_QUESTION', '선택지는 2개 혹은 3개여야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (options.some((option) => !option.trim())) {
      throw new DomainException('BET_QUESTION', '모든 선택지는 내용이 있어야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (!question.trim()) {
      throw new DomainException('BET_QUESTION', '질문 내용은 필수입니다', HttpStatus.BAD_REQUEST);
    }

    const now = DateUtil.now();

    return new BetQuestion(id, sport, order, question, options, now, now, null);
  }

  get sport(): Sport {
    return this._sport;
  }

  get order(): number {
    return this._order;
  }

  get question(): string {
    return this._question;
  }

  get options(): string[] {
    return [...this._options];
  }

  get optionCount(): number {
    return this._options.length;
  }

  public updateQuestion(question: string, options: string[]): void {
    if (!question.trim()) {
      throw new DomainException('BET_QUESTION', '질문 내용은 필수입니다', HttpStatus.BAD_REQUEST);
    }

    if (options.length < 2 || options.length > 3) {
      throw new DomainException('BET_QUESTION', '선택지는 2개 혹은 3개여야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (options.some((option) => !option.trim())) {
      throw new DomainException('BET_QUESTION', '모든 선택지는 내용이 있어야 합니다', HttpStatus.BAD_REQUEST);
    }

    this._question = question;
    this._options = [...options];
    this.touch();
  }

  public updateOrder(order: number): void {
    if (order < 1 || order > 5) {
      throw new DomainException('BET_QUESTION', '질문 순서는 1-5 사이여야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(order)) {
      throw new DomainException('BET_QUESTION', '질문 순서는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    this._order = order;
    this.touch();
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): BetQuestionPrimitives {
    return {
      id: this.id,
      sport: this.sport,
      order: this.order,
      question: this.question,
      options: this.options,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: BetQuestionPrimitives): BetQuestion {
    return new BetQuestion(
      primitives.id,
      primitives.sport,
      primitives.order,
      primitives.question,
      primitives.options,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
