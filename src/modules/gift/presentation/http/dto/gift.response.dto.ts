import { ApiProperty } from '@nestjs/swagger';

import { GiftPrimitives } from '~/modules/gift/domain/model/gift';

export class GiftResponseDto {
  @ApiProperty({
    description: '경품 ID',
  })
  id: string;

  @ApiProperty({
    description: '경품 이름',
  })
  name: string;

  @ApiProperty({
    description: '경품 별칭',
  })
  alias: string;

  @ApiProperty({
    description: '필요한 티켓 수',
  })
  requiredTicket: number;

  @ApiProperty({
    description: '경품 이미지 URL',
  })
  imageUrl: string;

  static fromPrimitives(primitives: GiftPrimitives): GiftResponseDto {
    const dto = new GiftResponseDto();
    dto.id = primitives.id;
    dto.name = primitives.name;
    dto.alias = primitives.alias;
    dto.requiredTicket = primitives.requiredTicket;
    dto.imageUrl = primitives.imageUrl;
    return dto;
  }
}
