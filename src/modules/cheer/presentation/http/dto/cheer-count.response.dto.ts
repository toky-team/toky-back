import { ApiProperty } from '@nestjs/swagger';

import { CheerSummaryDto } from '~/modules/cheer/application/dto/cheer-summary.dto';

export class CheerCountResponseDto {
  @ApiProperty({
    description: '고려대학교 응원 수',
    example: 100,
  })
  KUCheer: number;

  @ApiProperty({
    description: '연세대학교 응원 수',
    example: 200,
  })
  YUCheer: number;

  public static fromResult(result: CheerSummaryDto): CheerCountResponseDto {
    const dto = new CheerCountResponseDto();
    dto.KUCheer = result.KUCheer;
    dto.YUCheer = result.YUCheer;
    return dto;
  }
}
