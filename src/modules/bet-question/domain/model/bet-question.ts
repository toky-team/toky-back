import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';

export interface BetQuestionPrimitives {
  id: string;
  sport: Sport;
  question: string;
  positionFilter: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type BetQuestionDomainEvent = never;

export class BetQuestion extends AggregateRoot<BetQuestionPrimitives, BetQuestionDomainEvent> {
  private _sport: Sport;
  private _question: string;
  private _positionFilter: string | null;

  private constructor(
    id: string,
    sport: Sport,
    question: string,
    positionFilter: string | null,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._sport = sport;
    this._question = question;
    this._positionFilter = positionFilter;
  }

  public static create(id: string, sport: Sport, question: string, positionFilter: string | null): BetQuestion {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_QUESTION', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (question.trim().length === 0) {
      throw new DomainException('BET_QUESTION', '질문은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    return new BetQuestion(id, sport, question, positionFilter, now, now, null);
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get question(): string {
    return this._question;
  }

  public get positionFilter(): string | null {
    return this._positionFilter;
  }

  public changeQuestion(newQuestion: string): void {
    if (newQuestion.trim().length === 0) {
      throw new DomainException('BET_QUESTION', '질문은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this._question = newQuestion;
    this.touch();
  }

  public changeFilter(newFilter: string | null): void {
    this._positionFilter = newFilter;
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
      question: this.question,
      positionFilter: this.positionFilter,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: BetQuestionPrimitives): BetQuestion {
    const betQuestion = new BetQuestion(
      primitives.id,
      primitives.sport,
      primitives.question,
      primitives.positionFilter,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
    return betQuestion;
  }
}
