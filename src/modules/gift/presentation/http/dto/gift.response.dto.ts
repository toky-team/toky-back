import { ApiProperty } from '@nestjs/swagger';

import { GiftWithDrawInfoDto } from '~/modules/gift/application/dto/gift-with-draw-info.dto';
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

  @ApiProperty({
    description: '응모 횟수',
  })
  drawCount: number;

  @ApiProperty({
    description: '사용자가 응모한 횟수',
  })
  drawCountByUser?: number;

  static fromPrimitives(primitives: GiftPrimitives): GiftResponseDto {
    const dto = new GiftResponseDto();
    dto.id = primitives.id;
    dto.name = primitives.name;
    dto.alias = primitives.alias;
    dto.requiredTicket = primitives.requiredTicket;
    dto.imageUrl = primitives.imageUrl;
    dto.drawCount = primitives.drawCount;
    return dto;
  }

  static fromResult(result: GiftWithDrawInfoDto): GiftResponseDto {
    const dto = new GiftResponseDto();
    dto.id = result.id;
    dto.name = result.name;
    dto.alias = result.alias;
    dto.requiredTicket = result.requiredTicket;
    dto.imageUrl = result.imageUrl;
    dto.drawCount = result.drawCount;
    dto.drawCountByUser = result.drawCountByUser;
    return dto;
  }
}
