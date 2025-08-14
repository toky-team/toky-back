import { ApiProperty } from '@nestjs/swagger';

import { BetSummaryDto } from '~/modules/bet-answer/application/dto/bet-summary.dto';

export class BetSummaryResponseDto {
  @ApiProperty({
    description: '고려대학교 스코어',
    example: 3,
  })
  kuScore: number;

  @ApiProperty({
    description: '연세대학교 스코어',
    example: 2,
  })
  yuScore: number;

  static fromResult(result: BetSummaryDto): BetSummaryResponseDto {
    const dto = new BetSummaryResponseDto();
    dto.kuScore = result.kuScore;
    dto.yuScore = result.yuScore;
    return dto;
  }
}
