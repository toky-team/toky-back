import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { GiftFacade } from '~/modules/gift/application/port/in/gift-facade.port';
import { GiftResponseDto } from '~/modules/gift/presentation/http/dto/gift.response.dto';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftFacade: GiftFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '경품 목록 조회',
    description: '응모 가능한 경품 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '경품 목록 조회 성공',
    type: [GiftResponseDto],
  })
  @Public()
  async getGifts(): Promise<GiftResponseDto[]> {
    const gifts = await this.giftFacade.getGifts();
    return gifts.map((gift) => GiftResponseDto.fromPrimitives(gift));
  }
}
