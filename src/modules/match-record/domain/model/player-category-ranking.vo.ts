import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { PlayerRankingVO } from '~/modules/match-record/domain/model/player-ranking.vo';

export interface PlayerCategoryRankingProps {
  category: string;
  players: PlayerRankingVO[];
}

export class PlayerCategoryRankingVO extends ValueObject<PlayerCategoryRankingProps> {
  private constructor(props: PlayerCategoryRankingProps) {
    super(props);
  }

  public static create(category: string, players: PlayerRankingVO[]): PlayerCategoryRankingVO {
    const newCategoryRanking = new PlayerCategoryRankingVO({ category, players });
    newCategoryRanking.validate();
    return newCategoryRanking;
  }

  private validate(): void {
    if (!this.props.category || this.props.category.trim().length === 0) {
      throw new DomainException('MATCH_RECORD', '카테고리는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!Array.isArray(this.props.players) || this.props.players.length === 0) {
      throw new DomainException('MATCH_RECORD', '선수 목록은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
  }

  get category(): string {
    return this.props.category;
  }

  get players(): PlayerRankingVO[] {
    return this.props.players;
  }

  override toString(): string {
    return `PlayerCategoryRanking(category: ${this.category}, players: ${this.players.length})`;
  }
}
