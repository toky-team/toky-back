import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';

class UniversityStatDto {
  @ApiProperty({
    description: '대학',
  })
  university: University;

  @ApiProperty({
    description: '통계',
  })
  stats: Record<string, string>;
}

class PlayerStatDto {
  @ApiProperty({
    description: '선수 ID',
    type: String,
    nullable: true,
  })
  playerId: string | null;

  @ApiProperty({
    description: '이름',
  })
  name: string;

  @ApiProperty({
    description: '대학',
  })
  university: University;

  @ApiProperty({
    description: '포지션',
    type: String,
    nullable: true,
  })
  position: string | null;

  @ApiProperty({
    description: '통계',
  })
  stats: Record<string, string>;
}

class PlayerStatsWithCategoryDto {
  @ApiProperty({
    description: '카테고리',
    example: '투수',
  })
  category: string;

  @ApiProperty({
    description: '선수 통계 키',
    example: ['승', '패', '세이브'],
  })
  playerStatKeys: string[];

  @ApiProperty({
    description: '선수별 통계',
    type: [PlayerStatDto],
  })
  playerStats: PlayerStatDto[];
}

export class MatchRecordResponseDto {
  @ApiProperty({
    description: '종목',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '리그 이름',
    example: 'U리그',
  })
  league: string;

  @ApiProperty({
    description: '대학 통계 키',
    example: ['승', '패', '무'],
  })
  universityStatKeys: string[];

  @ApiProperty({
    description: '대학별 통계',
    type: [UniversityStatDto],
  })
  universityStats: UniversityStatDto[];

  @ApiProperty({
    description: '카테고리별 선수 통계',
    type: [PlayerStatsWithCategoryDto],
  })
  playerStatsWithCategory: PlayerStatsWithCategoryDto[];

  static fromPrimitives(record: MatchRecordPrimitives): MatchRecordResponseDto {
    const response = new MatchRecordResponseDto();
    response.sport = record.sport;
    response.league = record.league;
    response.universityStatKeys = record.universityStatKeys;
    response.universityStats = record.universityStats.map((stat) => ({
      university: stat.university,
      stats: stat.stats,
    }));
    response.playerStatsWithCategory = record.playerStatsWithCategory.map((category) => ({
      category: category.category,
      playerStatKeys: category.playerStatKeys,
      playerStats: category.players.map((player) => ({
        playerId: player.playerId,
        name: player.name,
        university: player.university,
        position: player.position,
        stats: player.stats,
      })),
    }));
    return response;
  }
}
