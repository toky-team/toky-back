import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export class CheerResponseDto {
  @ApiProperty({
    description: '스포츠 종류',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '고려대학교 응원 수',
  })
  KULike: number;

  @ApiProperty({
    description: '연세대학교 응원 수',
  })
  YULike: number;

  public static fromPrimitives(primitives: CheerPrimitives): CheerResponseDto {
    const dto = new CheerResponseDto();
    dto.sport = primitives.sport;
    dto.KULike = primitives.KULike;
    dto.YULike = primitives.YULike;
    return dto;
  }
}
