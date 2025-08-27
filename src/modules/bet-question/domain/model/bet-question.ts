import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchResult } from '~/libs/enums/match-result';
import { SCORE_PREDICTABLE_SPORTS, Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { AnswerRemovedEvent } from '~/modules/bet-question/domain/event/answer-removed.event';
import { AnswerSetEvent } from '~/modules/bet-question/domain/event/answet-set.event';

export interface BetQuestionPrimitives {
  id: string;
  sport: Sport;
  question: string;
  positionFilter: string | null;
  answer: {
    predict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      };
    };
    kuPlayer: {
      playerId: string | null;
    };
    yuPlayer: {
      playerId: string | null;
    };
  } | null;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type BetQuestionDomainEvent = AnswerSetEvent | AnswerRemovedEvent;

export class BetQuestion extends AggregateRoot<BetQuestionPrimitives, BetQuestionDomainEvent> {
  private _sport: Sport;
  private _question: string;
  private _positionFilter: string | null;
  private _answer: {
    predict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      };
    };
    kuPlayer: {
      playerId: string | null;
    };
    yuPlayer: {
      playerId: string | null;
    };
  } | null;

  private constructor(
    id: string,
    sport: Sport,
    question: string,
    positionFilter: string | null,
    answer: {
      predict: {
        matchResult: MatchResult;
        score: {
          kuScore: number;
          yuScore: number;
        };
      };
      kuPlayer: {
        playerId: string | null;
      };
      yuPlayer: {
        playerId: string | null;
      };
    } | null,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._sport = sport;
    this._question = question;
    this._positionFilter = positionFilter;
    this._answer = answer;
  }

  public static create(id: string, sport: Sport, question: string, positionFilter: string | null): BetQuestion {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('BET_QUESTION', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (question.trim().length === 0) {
      throw new DomainException('BET_QUESTION', '질문은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    return new BetQuestion(id, sport, question, positionFilter, null, now, now, null);
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

  public get answer(): {
    predict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      };
    };
    kuPlayer: {
      playerId: string | null;
    };
    yuPlayer: {
      playerId: string | null;
    };
  } | null {
    return this._answer;
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

  public setAnswer(
    answer: {
      predict: {
        matchResult: MatchResult;
        score: {
          kuScore: number;
          yuScore: number;
        };
      };
      kuPlayer: {
        playerId: string | null;
      };
      yuPlayer: {
        playerId: string | null;
      };
    } | null
  ): void {
    if (answer !== null) {
      if (answer.predict.score.kuScore < 0 || answer.predict.score.yuScore < 0) {
        throw new DomainException('BET_QUESTION', '점수는 0 이상이어야 합니다', HttpStatus.BAD_REQUEST);
      }
      if (
        Number.isInteger(answer.predict.score.kuScore) === false ||
        Number.isInteger(answer.predict.score.yuScore) === false
      ) {
        throw new DomainException('BET_QUESTION', '점수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
      }

      switch (answer.predict.matchResult) {
        case MatchResult.KOREA_UNIVERSITY:
          if (answer.predict.score.kuScore <= answer.predict.score.yuScore) {
            throw new DomainException(
              'BET_QUESTION',
              '고려대학교 점수는 연세대학교 점수보다 커야 합니다',
              HttpStatus.BAD_REQUEST
            );
          }
          break;
        case MatchResult.YONSEI_UNIVERSITY:
          if (answer.predict.score.yuScore <= answer.predict.score.kuScore) {
            throw new DomainException(
              'BET_QUESTION',
              '연세대학교 점수는 고려대학교 점수보다 커야 합니다',
              HttpStatus.BAD_REQUEST
            );
          }
          break;
        case MatchResult.DRAW:
          if (answer.predict.score.kuScore !== answer.predict.score.yuScore) {
            throw new DomainException(
              'BET_QUESTION',
              '무승부인 경우 두 팀의 점수가 같아야 합니다',
              HttpStatus.BAD_REQUEST
            );
          }
          break;
        default:
          throw new DomainException('BET_QUESTION', '유효하지 않은 경기 결과입니다', HttpStatus.BAD_REQUEST);
      }
    }
    this._answer = answer;
    if (answer !== null) {
      this.addEvent(
        new AnswerSetEvent(
          this.id,
          this.sport,
          answer.predict.matchResult,
          answer.predict.score.kuScore,
          answer.predict.score.yuScore,
          answer.kuPlayer.playerId,
          answer.yuPlayer.playerId
        )
      );
    } else {
      this.addEvent(new AnswerRemovedEvent(this.id, this.sport));
    }
    this.touch();
  }

  public isAnswerSet(): boolean {
    return this._answer !== null;
  }

  public possibleAnswerCount(): number {
    if (SCORE_PREDICTABLE_SPORTS.includes(this.sport)) {
      // 경기결과, 점수, 고대선수, 연대선수
      return 4;
    } else {
      // 경기결과, 고대선수, 연대선수
      return 3;
    }
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
      answer: this.answer,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: BetQuestionPrimitives): BetQuestion {
    const betQuestion = new BetQuestion(
      primitives.id,
      primitives.sport,
      primitives.question,
      primitives.positionFilter,
      primitives.answer,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt
    );
    return betQuestion;
  }
}
