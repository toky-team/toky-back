import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

interface StatsProps {
  [key: string]: string;
}

export class StatsVO extends ValueObject<StatsProps> {
  private constructor(props: StatsProps) {
    super(props);
  }

  public static create(stats: Record<string, string>): StatsVO {
    const newStats = new StatsVO(stats);
    newStats.validate();
    return newStats;
  }

  private validate(): void {
    Object.entries(this.props).forEach(([key, value]) => {
      if (key.trim() === '') {
        throw new DomainException('PLAYER_STATS', `통계 키는 비어있을 수 없습니다`, HttpStatus.BAD_REQUEST);
      }
      if (value.trim() === '') {
        throw new DomainException('PLAYER_STATS', `통계 값은 비어있을 수 없습니다: ${key}`, HttpStatus.BAD_REQUEST);
      }
    });
  }

  public getStat(key: string): string | undefined {
    return this.props[key];
  }

  public getAllStats(): Record<string, string> {
    return this.props;
  }

  public hasStat(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.props, key);
  }

  override toString(): string {
    return `PlayerStats(${JSON.stringify(this.props)})`;
  }
}
