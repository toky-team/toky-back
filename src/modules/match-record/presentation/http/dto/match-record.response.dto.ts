import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';

class UniversityRankingDto {
  @ApiProperty({
    description: '순위',
  })
  rank: number;

  @ApiProperty({
    description: '대학',
  })
  university: University;

  @ApiProperty({
    description: '경기 수',
  })
  matchCount: number;

  @ApiProperty({
    description: '승리 수',
  })
  winCount: number;

  @ApiProperty({
    description: '무승부 수',
  })
  drawCount: number;

  @ApiProperty({
    description: '패배 수',
  })
  loseCount: number;

  @ApiProperty({
    description: '승률',
  })
  winRate: number;
}

class PlayerDto {
  @ApiProperty({
    description: '선수 ID',
    type: String,
    nullable: true,
  })
  playerId: string | null;

  @ApiProperty({
    description: '순위',
  })
  rank: number;

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
  })
  position: string;

  @ApiProperty({
    description: '통계',
  })
  stats: Record<string, number>;
}

class PlayerRankingDto {
  @ApiProperty({
    description: '카테고리',
    example: '투수',
  })
  category: string;

  @ApiProperty({
    description: '선수 목록',
    type: [PlayerDto],
  })
  players: PlayerDto[];
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
    description: '대학 순위',
    type: [UniversityRankingDto],
  })
  universityRankings: UniversityRankingDto[];

  @ApiProperty({
    description: '선수 순위',
    type: [PlayerRankingDto],
  })
  playerRankings: PlayerRankingDto[];

  static fromPrimitives(record: MatchRecordPrimitives): MatchRecordResponseDto {
    const dto = new MatchRecordResponseDto();
    dto.sport = record.sport;
    dto.league = record.league;
    dto.universityRankings = record.universityRankings.map((universityRanking) => {
      const rankingDto = new UniversityRankingDto();
      rankingDto.rank = universityRanking.rank;
      rankingDto.university = universityRanking.university;
      rankingDto.matchCount = universityRanking.matchCount;
      rankingDto.winCount = universityRanking.winCount;
      rankingDto.drawCount = universityRanking.drawCount;
      rankingDto.loseCount = universityRanking.loseCount;
      rankingDto.winRate = universityRanking.winRate;
      return rankingDto;
    });
    dto.playerRankings = record.playerRankings.map((playerRanking) => {
      const rankingDto = new PlayerRankingDto();
      rankingDto.category = playerRanking.category;
      rankingDto.players = playerRanking.players.map((player) => {
        const playerDto = new PlayerDto();
        playerDto.playerId = player.playerId;
        playerDto.rank = player.rank;
        playerDto.name = player.name;
        playerDto.university = player.university;
        playerDto.position = player.position;
        playerDto.stats = player.stats;
        return playerDto;
      });
      return rankingDto;
    });
    return dto;
  }
}
