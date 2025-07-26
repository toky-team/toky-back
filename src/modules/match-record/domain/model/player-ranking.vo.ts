import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { University } from '~/libs/enums/university';
import { PlayerStatsVO } from '~/modules/match-record/domain/model/player-stats.vo';

export interface PlayerRankingProps {
  playerId: string | null;
  rank: number;
  name: string;
  university: University;
  position: string;
  stats: PlayerStatsVO;
}

export class PlayerRankingVO extends ValueObject<PlayerRankingProps> {
  private constructor(props: PlayerRankingProps) {
    super(props);
  }

  public static create(
    playerId: string | null,
    rank: number,
    name: string,
    university: University,
    position: string,
    stats: PlayerStatsVO
  ): PlayerRankingVO {
    const newRanking = new PlayerRankingVO({
      playerId,
      rank,
      name,
      university,
      position,
      stats,
    });
    newRanking.validate();
    return newRanking;
  }

  private validate(): void {
    if (this.props.rank <= 0) {
      throw new DomainException('MATCH_RECORD', '순위는 1 이상이어야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (Number.isInteger(this.props.rank) === false) {
      throw new DomainException('MATCH_RECORD', '순위는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new DomainException('MATCH_RECORD', '선수명은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
  }

  get playerId(): string | null {
    return this.props.playerId;
  }

  get rank(): number {
    return this.props.rank;
  }

  get name(): string {
    return this.props.name;
  }

  get university(): University {
    return this.props.university;
  }

  get position(): string {
    return this.props.position;
  }

  get stats(): PlayerStatsVO {
    return this.props.stats;
  }

  override toString(): string {
    return `PlayerRanking(playerId: ${this.playerId}, rank: ${this.rank}, name: ${this.name}, university: ${this.university}, position: ${this.position})`;
  }
}
