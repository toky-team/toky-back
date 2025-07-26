import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { University } from '~/libs/enums/university';

export interface UniversityRangingProps {
  rank: number;
  university: University;
  matchCount: number;
  winCount: number;
  drawCount: number;
  loseCount: number;
  winRate: number;
}

export class UniversityRangingVO extends ValueObject<UniversityRangingProps> {
  private constructor(props: UniversityRangingProps) {
    super(props);
  }

  public static create(
    rank: number,
    university: University,
    matchCount: number,
    winCount: number,
    drawCount: number,
    loseCount: number,
    winRate: number
  ): UniversityRangingVO {
    const newRanging = new UniversityRangingVO({
      rank,
      university,
      matchCount,
      winCount,
      drawCount,
      loseCount,
      winRate,
    });
    newRanging.validate();
    return newRanging;
  }

  private validate(): void {
    if (this.props.rank <= 0) {
      throw new DomainException('MATCH_RECORD', '순위는 1 이상이어야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (Number.isInteger(this.props.rank) === false) {
      throw new DomainException('MATCH_RECORD', '순위는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (this.props.winCount < 0 || this.props.drawCount < 0 || this.props.loseCount < 0) {
      throw new DomainException('MATCH_RECORD', '경기 횟수는 0 이상이어야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (
      Number.isInteger(this.props.winCount) === false ||
      Number.isInteger(this.props.drawCount) === false ||
      Number.isInteger(this.props.loseCount) === false
    ) {
      throw new DomainException('MATCH_RECORD', '경기 횟수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (this.props.winRate < 0 || this.props.winRate > 1) {
      throw new DomainException('MATCH_RECORD', '승률은 0과 1 사이여야 합니다', HttpStatus.BAD_REQUEST);
    }
  }

  get rank(): number {
    return this.props.rank;
  }

  get university(): University {
    return this.props.university;
  }

  get matchCount(): number {
    return this.props.matchCount;
  }

  get winCount(): number {
    return this.props.winCount;
  }

  get drawCount(): number {
    return this.props.drawCount;
  }

  get loseCount(): number {
    return this.props.loseCount;
  }

  get winRate(): number {
    return this.props.winRate;
  }

  override toString(): string {
    return `UniversityRanging(rank: ${this.rank}, university: ${this.university}, matchCount: ${this.matchCount}, winCount: ${this.winCount}, drawCount: ${this.drawCount}, loseCount: ${this.loseCount}, winRate: ${this.winRate})`;
  }
}
