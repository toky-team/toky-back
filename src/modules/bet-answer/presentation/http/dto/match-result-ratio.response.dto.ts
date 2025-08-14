import { ApiProperty } from '@nestjs/swagger';

import { MatchResult } from '~/libs/enums/match-result';
import { MatchResultRatioDto } from '~/modules/bet-answer/application/dto/match-result-ratio.dto';

export class MatchResultRatioResponseDto {
  @ApiProperty({
    description: '고려대학교 승리 비율 (%)',
    example: 45,
  })
  [MatchResult.KOREA_UNIVERSITY]: number;

  @ApiProperty({
    description: '연세대학교 승리 비율 (%)',
    example: 40,
  })
  [MatchResult.YONSEI_UNIVERSITY]: number;

  @ApiProperty({
    description: '무승부 비율 (%)',
    example: 15,
  })
  [MatchResult.DRAW]: number;

  static fromResult(result: MatchResultRatioDto): MatchResultRatioResponseDto {
    const response = new MatchResultRatioResponseDto();
    response[MatchResult.KOREA_UNIVERSITY] = result[MatchResult.KOREA_UNIVERSITY];
    response[MatchResult.YONSEI_UNIVERSITY] = result[MatchResult.YONSEI_UNIVERSITY];
    response[MatchResult.DRAW] = result[MatchResult.DRAW];
    return response;
  }
}
