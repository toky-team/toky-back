import { ApiProperty } from '@nestjs/swagger';

import { PlayerMatchRecord } from '~/modules/match-record/application/dto/player-match-record.dto';

export class LeagueWithStatResponseDto {
  @ApiProperty({
    description: '리그 이름',
  })
  league: string;

  @ApiProperty({
    description: '리그 통계 키',
  })
  statKeys: string[];

  @ApiProperty({
    description: '리그 통계',
  })
  stats: Record<string, string>;
}

export class PlayerMatchRecordResponseDto {
  @ApiProperty({
    description: '선수 ID',
  })
  playerId: string;

  @ApiProperty({
    description: '선수 통계',
  })
  leagueStats: LeagueWithStatResponseDto[];

  public static fromResult(result: PlayerMatchRecord): PlayerMatchRecordResponseDto {
    const dto = new PlayerMatchRecordResponseDto();
    dto.playerId = result.playerId;
    dto.leagueStats = result.leagueWithStats.map((stat) => {
      return {
        league: stat.league,
        statKeys: stat.statKeys,
        stats: stat.stats,
      };
    });
    return dto;
  }
}
