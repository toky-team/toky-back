import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { GiftFacade } from '~/modules/gift/application/port/in/gift-facade.port';
import { DrawGiftRequestDto } from '~/modules/gift/presentation/http/dto/draw-gift.request.dto';
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
  @Public({
    includeCredential: true,
  })
  async getGifts(@Req() req: AuthenticatedRequest): Promise<GiftResponseDto[]> {
    const userId = req.user ? req.user.userId : undefined;
    const gifts = await this.giftFacade.getGifts(userId);
    return gifts.map((gift) => GiftResponseDto.fromResult(gift));
  }

  @Post('/:id/draw')
  @ApiOperation({
    summary: '경품 응모',
    description: '사용자가 경품에 응모합니다.',
  })
  @ApiBody({
    type: DrawGiftRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '경품 응모 성공',
  })
  async drawGift(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: DrawGiftRequestDto
  ): Promise<void> {
    await this.giftFacade.drawGift(req.user.userId, id, body.count);
  }
}
