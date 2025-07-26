import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { PlayerCategoryRankingVO } from '~/modules/match-record/domain/model/player-category-ranking.vo';
import { PlayerRankingVO } from '~/modules/match-record/domain/model/player-ranking.vo';
import { PlayerStatsVO } from '~/modules/match-record/domain/model/player-stats.vo';
import { UniversityRangingVO } from '~/modules/match-record/domain/model/university-ranging.vo';

export interface MatchRecordPrimitives {
  id: string;
  sport: Sport;
  league: string;
  universityRankings: {
    rank: number;
    university: University;
    matchCount: number;
    winCount: number;
    drawCount: number;
    loseCount: number;
    winRate: number;
  }[];
  playerRankings: {
    category: string;
    players: {
      playerId: string | null;
      rank: number;
      name: string;
      university: University;
      position: string;
      stats: Record<string, number>;
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
  private _universityRankings: UniversityRangingVO[];
  private _playerRankings: PlayerCategoryRankingVO[];

  private constructor(
    id: string,
    sport: Sport,
    league: string,
    universityRankings: UniversityRangingVO[],
    playerRankings: PlayerCategoryRankingVO[],
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._sport = sport;
    this._league = league;
    this._universityRankings = universityRankings;
    this._playerRankings = playerRankings;
  }

  public static generateId(sport: Sport, league: string): string {
    return `${sport}_${league}`.replace(/\s+/g, '_').toLowerCase();
  }

  public static create(
    sport: Sport,
    league: string,
    universityRankings: {
      rank: number;
      university: University;
      matchCount: number;
      winCount: number;
      drawCount: number;
      loseCount: number;
      winRate: number;
    }[],
    playerRankings: {
      category: string;
      players: {
        playerId: string | null;
        rank: number;
        name: string;
        university: University;
        position: string;
        stats: Record<string, number>;
      }[];
    }[]
  ): MatchRecord {
    const id = MatchRecord.generateId(sport, league);
    const now = DateUtil.now();

    if (!league || league.trim().length === 0) {
      throw new DomainException('MATCH_RECORD', '리그명은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!universityRankings || universityRankings.length === 0) {
      throw new DomainException('MATCH_RECORD', '대학 순위는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!playerRankings || playerRankings.length === 0) {
      throw new DomainException('MATCH_RECORD', '선수 순위는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const universityRankingVOs = universityRankings.map((ranking) =>
      UniversityRangingVO.create(
        ranking.rank,
        ranking.university,
        ranking.matchCount,
        ranking.winCount,
        ranking.drawCount,
        ranking.loseCount,
        ranking.winRate
      )
    );

    const playerCategoryRankings = playerRankings.map((category) =>
      PlayerCategoryRankingVO.create(
        category.category,
        category.players.map((player) =>
          PlayerRankingVO.create(
            player.playerId,
            player.rank,
            player.name,
            player.university,
            player.position,
            PlayerStatsVO.create(player.stats)
          )
        )
      )
    );

    return new MatchRecord(id, sport, league, universityRankingVOs, playerCategoryRankings, now, now, null);
  }

  get sport(): Sport {
    return this._sport;
  }

  get league(): string {
    return this._league;
  }

  get universityRankings(): UniversityRangingVO[] {
    return this._universityRankings;
  }

  get playerRankings(): PlayerCategoryRankingVO[] {
    return this._playerRankings;
  }

  public updateRankings(universityRankings: UniversityRangingVO[], playerRankings: PlayerCategoryRankingVO[]): void {
    this._universityRankings = universityRankings;
    this._playerRankings = playerRankings;
    this.touch();
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
      universityRankings: this._universityRankings.map((ranking) => {
        return {
          rank: ranking.rank,
          university: ranking.university,
          matchCount: ranking.matchCount,
          winCount: ranking.winCount,
          drawCount: ranking.drawCount,
          loseCount: ranking.loseCount,
          winRate: ranking.winRate,
        };
      }),
      playerRankings: this._playerRankings.map((category) => {
        return {
          category: category.category,
          players: category.players.map((player) => {
            return {
              playerId: player.playerId,
              rank: player.rank,
              name: player.name,
              university: player.university,
              position: player.position,
              stats: player.stats.toPrimitives(),
            };
          }),
        };
      }),
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: MatchRecordPrimitives): MatchRecord {
    const universityRankings = primitives.universityRankings.map((ranking) =>
      UniversityRangingVO.create(
        ranking.rank,
        ranking.university,
        ranking.matchCount,
        ranking.winCount,
        ranking.drawCount,
        ranking.loseCount,
        ranking.winRate
      )
    );

    const playerRankings = primitives.playerRankings.map((category) =>
      PlayerCategoryRankingVO.create(
        category.category,
        category.players.map((player) =>
          PlayerRankingVO.create(
            player.playerId,
            player.rank,
            player.name,
            player.university,
            player.position,
            PlayerStatsVO.create(player.stats)
          )
        )
      )
    );

    return new MatchRecord(
      primitives.id,
      primitives.sport,
      primitives.league,
      universityRankings,
      playerRankings,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
