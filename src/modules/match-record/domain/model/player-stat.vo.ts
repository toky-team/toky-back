import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { University } from '~/libs/enums/university';
import { StatsVO } from '~/modules/match-record/domain/model/stats.vo';

export interface PlayerStatsProps {
  playerId: string | null;
  name: string;
  university: University;
  position: string | null;
  stats: StatsVO;
}

export class PlayerStatsVO extends ValueObject<PlayerStatsProps> {
  private constructor(props: PlayerStatsProps) {
    super(props);
  }

  public static create(
    playerId: string | null,
    name: string,
    university: University,
    position: string | null,
    stats: StatsVO
  ): PlayerStatsVO {
    const newRanking = new PlayerStatsVO({
      playerId,
      name,
      university,
      position,
      stats,
    });
    newRanking.validate();
    return newRanking;
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new DomainException('MATCH_RECORD', '선수명은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (this.props.university === null || this.props.university === undefined) {
      throw new DomainException('MATCH_RECORD', '대학 정보는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Object.values(University).includes(this.props.university)) {
      throw new DomainException('MATCH_RECORD', '유효하지 않은 대학 정보입니다', HttpStatus.BAD_REQUEST);
    }
  }

  get playerId(): string | null {
    return this.props.playerId;
  }

  get name(): string {
    return this.props.name;
  }

  get university(): University {
    return this.props.university;
  }

  get position(): string | null {
    return this.props.position;
  }

  get stats(): StatsVO {
    return this.props.stats;
  }

  override toString(): string {
    return `PlayerRanking(playerId: ${this.playerId}, name: ${this.name}, university: ${this.university}, position: ${this.position}, stats: ${this.stats.toString()})`;
  }
}
