import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { PlayerStatsVO } from '~/modules/match-record/domain/model/player-stat.vo';
import { PlayerStatsWithCategoryVO } from '~/modules/match-record/domain/model/player-stats-with-category.vo';
import { StatsVO } from '~/modules/match-record/domain/model/stats.vo';
import { UniversityStatsVO } from '~/modules/match-record/domain/model/university-stat.vo';

export interface MatchRecordPrimitives {
  id: string;
  sport: Sport;
  league: string;
  universityStatKeys: string[];
  universityStats: {
    university: University;
    stats: Record<string, string>;
  }[];
  playerStatsWithCategory: {
    category: string;
    playerStatKeys: string[];
    players: {
      playerId: string | null;
      name: string;
      university: University;
      position: string | null;
      stats: Record<string, string>;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type MatchRecordDomainEvent = never;

export class MatchRecord extends AggregateRoot<MatchRecordPrimitives, MatchRecordDomainEvent> {
  private _sport: Sport;
  private _league: string;
  private _universityStatKeys: string[];
  private _universityStats: UniversityStatsVO[];
  private _playerStatsWithCategory: PlayerStatsWithCategoryVO[];

  private constructor(
    id: string,
    sport: Sport,
    league: string,
    universityStatKeys: string[],
    universityStats: UniversityStatsVO[],
    playerStatsWithCategory: PlayerStatsWithCategoryVO[],
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._sport = sport;
    this._league = league;
    this._universityStatKeys = universityStatKeys;
    this._universityStats = universityStats;
    this._playerStatsWithCategory = playerStatsWithCategory;
  }

  public static generateId(sport: Sport, league: string): string {
    return `${sport}_${league}`.replace(/\s+/g, '_').toLowerCase();
  }

  public static create(
    sport: Sport,
    league: string,
    universityStats: {
      university: University;
      stats: Record<string, string>;
    }[],
    playerStatsWithCategory: {
      category: string;
      players: {
        playerId: string | null;
        name: string;
        university: University;
        position: string | null;
        stats: Record<string, string>;
      }[];
    }[]
  ): MatchRecord {
    const id = MatchRecord.generateId(sport, league);
    const now = DateUtil.now();

    if (!league || league.trim().length === 0) {
      throw new DomainException('MATCH_RECORD', '리그명은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const universityStatVOs = universityStats.map((stat) =>
      UniversityStatsVO.create(stat.university, StatsVO.create(stat.stats))
    );

    const statKeys = universityStats.length > 0 ? Object.keys(universityStatVOs[0].stats.getAllStats()) : [];
    if (statKeys.length > 0) {
      for (const stat of universityStatVOs) {
        if (!statKeys.every((key) => stat.stats.hasStat(key))) {
          throw new DomainException(
            'MATCH_RECORD',
            `모든 대학의 통계가 동일한 키를 가져야 합니다: ${statKeys.join(', ')}`,
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    const playerStatsWithCategoryVOs = playerStatsWithCategory.map((category) =>
      PlayerStatsWithCategoryVO.create(
        category.category,
        category.players.map((player) =>
          PlayerStatsVO.create(
            player.playerId,
            player.name,
            player.university,
            player.position,
            StatsVO.create(player.stats)
          )
        )
      )
    );

    return new MatchRecord(id, sport, league, statKeys, universityStatVOs, playerStatsWithCategoryVOs, now, now, null);
  }

  get sport(): Sport {
    return this._sport;
  }

  get league(): string {
    return this._league;
  }

  get universityStatKeys(): string[] {
    return this._universityStatKeys;
  }

  get universityStats(): UniversityStatsVO[] {
    return this._universityStats;
  }

  get playerStatsWithCategory(): PlayerStatsWithCategoryVO[] {
    return this._playerStatsWithCategory;
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): MatchRecordPrimitives {
    return {
      id: this.id,
      sport: this._sport,
      league: this._league,
      universityStatKeys: this._universityStatKeys,
      universityStats: this._universityStats.map((stat) => ({
        university: stat.university,
        stats: stat.stats.getAllStats(),
      })),
      playerStatsWithCategory: this._playerStatsWithCategory.map((category) => ({
        category: category.category,
        playerStatKeys: category.playerStatKeys,
        players: category.playerStats.map((player) => ({
          playerId: player.playerId,
          name: player.name,
          university: player.university,
          position: player.position,
          stats: player.stats.getAllStats(),
        })),
      })),
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: MatchRecordPrimitives): MatchRecord {
    const {
      id,
      sport,
      league,
      universityStatKeys,
      universityStats,
      playerStatsWithCategory,
      createdAt,
      updatedAt,
      deletedAt,
    } = primitives;

    const universityStatVOs = universityStats.map((stat) =>
      UniversityStatsVO.create(stat.university, StatsVO.create(stat.stats))
    );

    const playerStatsWithCategoryVOs = playerStatsWithCategory.map((category) =>
      PlayerStatsWithCategoryVO.create(
        category.category,
        category.players.map((player) =>
          PlayerStatsVO.create(
            player.playerId,
            player.name,
            player.university,
            player.position,
            StatsVO.create(player.stats)
          )
        )
      )
    );

    return new MatchRecord(
      id,
      sport,
      league,
      universityStatKeys,
      universityStatVOs,
      playerStatsWithCategoryVOs,
      DateUtil.toKst(createdAt),
      DateUtil.toKst(updatedAt),
      deletedAt ? DateUtil.toKst(deletedAt) : null
    );
  }
}
