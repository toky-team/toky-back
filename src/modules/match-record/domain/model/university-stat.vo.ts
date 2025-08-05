import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { University } from '~/libs/enums/university';
import { StatsVO } from '~/modules/match-record/domain/model/stats.vo';

export interface UniversityStatsProps {
  university: University;
  stats: StatsVO;
}

export class UniversityStatsVO extends ValueObject<UniversityStatsProps> {
  private constructor(props: UniversityStatsProps) {
    super(props);
  }

  public static create(university: University, stats: StatsVO): UniversityStatsVO {
    const newStats = new UniversityStatsVO({
      university,
      stats,
    });
    newStats.validate();
    return newStats;
  }

  private validate(): void {
    if (this.props.university === null || this.props.university === undefined) {
      throw new DomainException('MATCH_RECORD', '대학 정보는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Object.values(University).includes(this.props.university)) {
      throw new DomainException('MATCH_RECORD', '유효하지 않은 대학 정보입니다', HttpStatus.BAD_REQUEST);
    }
  }

  get university(): University {
    return this.props.university;
  }

  get stats(): StatsVO {
    return this.props.stats;
  }

  override toString(): string {
    return `UniversityStats(university: ${this.university}, stats: ${this.stats.toString()})`;
  }
}
