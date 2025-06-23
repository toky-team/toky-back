import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

export class ScoreResponseDto {
  @ApiProperty({
    description: '스포츠 종류',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: 'KU 점수',
  })
  KUScore: number;

  @ApiProperty({
    description: 'YU 점수',
  })
  YUScore: number;

  @ApiProperty({
    description: '경기 활성화 여부',
  })
  isActive: boolean;

  static fromPrimitives(score: ScorePrimitives): ScoreResponseDto {
    const dto = new ScoreResponseDto();
    dto.sport = score.sport;
    dto.KUScore = score.KUScore;
    dto.YUScore = score.YUScore;
    dto.isActive = score.isActive;
    return dto;
  }
}
