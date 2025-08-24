import { ApiProperty } from '@nestjs/swagger';

import { University } from '~/libs/enums/university';
import { ActivityRankDto } from '~/modules/activity/application/dto/activity-rank.dto';

export class ActivityRankResponseDto {
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
    description: '활동 점수',
  })
  score: number;

  @ApiProperty({
    description: '활동 랭크',
  })
  rank: number;

  public static fromResult(result: ActivityRankDto): ActivityRankResponseDto {
    const dto = new ActivityRankResponseDto();
    dto.userId = result.userId;
    dto.username = result.username;
    dto.university = result.university;
    dto.score = result.score;
    dto.rank = result.rank;
    return dto;
  }
}
