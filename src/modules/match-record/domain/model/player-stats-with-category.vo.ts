import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { PlayerStatsVO } from '~/modules/match-record/domain/model/player-stat.vo';

export interface PlayerStatsWithCategoryProps {
  category: string;
  playerStatKeys: string[];
  playerStats: PlayerStatsVO[];
}

export class PlayerStatsWithCategoryVO extends ValueObject<PlayerStatsWithCategoryProps> {
  private constructor(props: PlayerStatsWithCategoryProps) {
    super(props);
  }

  public static create(category: string, playerStats: PlayerStatsVO[]): PlayerStatsWithCategoryVO {
    const statKeys = playerStats.length > 0 ? Object.keys(playerStats[0].stats.getAllStats()) : [];

    if (statKeys.length > 0) {
      for (const stat of playerStats) {
        if (!statKeys.every((key) => stat.stats.hasStat(key))) {
          throw new DomainException(
            'MATCH_RECORD',
            `모든 선수의 통계가 동일한 키를 가져야 합니다: ${statKeys.join(', ')}`,
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    const newCategoryRanking = new PlayerStatsWithCategoryVO({ category, playerStatKeys: statKeys, playerStats });
    newCategoryRanking.validate();
    return newCategoryRanking;
  }

  private validate(): void {
    if (!this.props.category || this.props.category.trim().length === 0) {
      throw new DomainException('MATCH_RECORD', '카테고리는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
  }

  get category(): string {
    return this.props.category;
  }

  get playerStatKeys(): string[] {
    return this.props.playerStatKeys;
  }

  get playerStats(): PlayerStatsVO[] {
    return this.props.playerStats;
  }

  override toString(): string {
    return `PlayerCategoryRanking(category: ${this.category}, players: ${this.playerStats.length})`;
  }
}
