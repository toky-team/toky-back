import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

interface PlayerStatsProps {
  [key: string]: number;
}

export class PlayerStatsVO extends ValueObject<PlayerStatsProps> {
  private constructor(props: PlayerStatsProps) {
    super(props);
  }

  public static create(stats: Record<string, number>): PlayerStatsVO {
    const newStats = new PlayerStatsVO(stats);
    newStats.validate();
    return newStats;
  }

  private validate(): void {
    Object.entries(this.props).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        throw new DomainException('MATCH_RECORD', `스탯 ${key}는 0 이상의 숫자여야 합니다`, HttpStatus.BAD_REQUEST);
      }
    });
  }

  public getStat(key: string): number | undefined {
    return this.props[key];
  }

  public getAllStats(): Record<string, number> {
    return this.props;
  }

  override toString(): string {
    return `PlayerStats(${JSON.stringify(this.props)})`;
  }
}
