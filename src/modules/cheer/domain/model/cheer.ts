import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';

export interface CheerPrimitives {
  id: string;
  userId: string;
  university: University;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type CheerDomainEvent = never;

export class Cheer extends AggregateRoot<CheerPrimitives, CheerDomainEvent> {
  private _userId: string;
  private _university: University;

  private constructor(
    id: string,
    userId: string,
    university: University,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._university = university;
  }

  public static create(id: string, userId: string, university: University): Cheer {
    const now = DateUtil.now();

    if (!userId) {
      throw new DomainException('CHEER', '사용자 ID는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    if (!Object.values(University).includes(university)) {
      throw new DomainException('CHEER', '유효하지 않은 대학교입니다.', HttpStatus.BAD_REQUEST);
    }

    return new Cheer(id, userId, university, now, now, null);
  }

  public get userId(): string {
    return this._userId;
  }

  public get university(): University {
    return this._university;
  }

  public changeUniversity(university: University): void {
    if (!Object.values(University).includes(university)) {
      throw new DomainException('CHEER', '유효하지 않은 대학교입니다.', HttpStatus.BAD_REQUEST);
    }

    this._university = university;
    this.touch();
  }

  public toPrimitives(): CheerPrimitives {
    return {
      id: this.id,
      userId: this._userId,
      university: this._university,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: CheerPrimitives): Cheer {
    return new Cheer(
      primitives.id,
      primitives.userId,
      primitives.university,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt
    );
  }
}
