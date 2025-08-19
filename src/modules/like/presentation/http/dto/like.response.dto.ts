import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { LikePrimitives } from '~/modules/like/domain/model/like';

export class LikeResponseDto {
  @ApiProperty({
    description: '스포츠 종류',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '고려대학교 좋아요 수',
  })
  KULike: number;

  @ApiProperty({
    description: '연세대학교 좋아요 수',
  })
  YULike: number;

  public static fromPrimitives(primitives: LikePrimitives): LikeResponseDto {
    const dto = new LikeResponseDto();
    dto.sport = primitives.sport;
    dto.KULike = primitives.KULike;
    dto.YULike = primitives.YULike;
    return dto;
  }
}
