import { ApiProperty } from '@nestjs/swagger';

import { University } from '~/libs/enums/university';
import { BetHitRankDto } from '~/modules/bet-hit/application/dto/bet-hit-rank.dto';

export class BetHitRankResponseDto {
  @ApiProperty({
    description: '사용자 ID',
  })
  userId: string;

  @ApiProperty({
    description: '사용자 닉네임',
  })
  username: string;

  @ApiProperty({
    description: '사용자 대학',
    enum: University,
  })
  university: University;

  @ApiProperty({
    description: '적중률 (%)',
  })
  hitRate: number;

  @ApiProperty({
    description: '활동 랭크',
  })
  rank: number;

  public static fromResult(result: BetHitRankDto): BetHitRankResponseDto {
    const dto = new BetHitRankResponseDto();
    dto.userId = result.userId;
    dto.username = result.username;
    dto.university = result.university;
    dto.hitRate = result.hitRate;
    dto.rank = result.rank;
    return dto;
  }
}
