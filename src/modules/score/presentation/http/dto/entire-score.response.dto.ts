import { ApiProperty } from '@nestjs/swagger';

import { EntireScore } from '~/modules/score/application/dto/entire-score.dto';

export class EntireScoreResponseDto {
  @ApiProperty({
    description: 'KU 점수',
  })
  KUScore: number;

  @ApiProperty({
    description: 'YU 점수',
  })
  YUScore: number;

  static fromResult(entireScore: EntireScore): EntireScoreResponseDto {
    const dto = new EntireScoreResponseDto();
    dto.KUScore = entireScore.KUScore;
    dto.YUScore = entireScore.YUScore;
    return dto;
  }
}
