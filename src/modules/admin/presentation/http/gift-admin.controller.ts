import { Body, Controller, Delete, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  CreateGiftRequestDto,
  CreateGiftWithImageDto,
} from '~/modules/admin/presentation/http/dto/create-gift.request.dto';
import {
  UpdateGiftRequestDto,
  UpdateGiftWithImageDto,
} from '~/modules/admin/presentation/http/dto/update-gift.request.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { GiftInvoker } from '~/modules/gift/application/port/in/gift-invoker.port';
import { GiftResponseDto } from '~/modules/gift/presentation/http/dto/gift.response.dto';

@Controller('/admin/gift')
@ApiTags('Gift')
@UseGuards(AdminGuard)
export class GiftAdminController {
  constructor(private readonly giftInvoker: GiftInvoker) {}

  @Post('/')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '경품 추가',
    description: '새로운 경품을 추가합니다.',
  })
  @ApiBody({
    type: CreateGiftWithImageDto,
  })
  @ApiResponse({
    status: 201,
    description: '경품이 성공적으로 추가되었습니다.',
    type: GiftResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async createGift(
    @Body() body: CreateGiftRequestDto,
    @UploadedFile() image: Express.Multer.File
  ): Promise<GiftResponseDto> {
    const { name, alias, requiredTicket } = body;
    const createdGift = await this.giftInvoker.createGift(name, alias, requiredTicket, image);

    return GiftResponseDto.fromPrimitives(createdGift);
  }

  @Patch('/:id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '경품 수정',
    description: '기존 경품 정보를 수정합니다.',
  })
  @ApiBody({
    type: UpdateGiftWithImageDto,
  })
  @ApiResponse({
    status: 200,
    description: '경품이 성공적으로 수정되었습니다.',
    type: GiftResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async updateGift(
    @Param('id') id: string,
    @Body() body: UpdateGiftRequestDto,
    @UploadedFile() image: Express.Multer.File
  ): Promise<GiftResponseDto> {
    const { name, alias, requiredTicket } = body;
    const updatedGift = await this.giftInvoker.updateGift(id, name, alias, requiredTicket, image);

    return GiftResponseDto.fromPrimitives(updatedGift);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '경품 삭제',
    description: '기존 경품 정보를 삭제합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '경품이 성공적으로 삭제되었습니다.',
  })
  async deleteGift(@Param('id') id: string): Promise<void> {
    await this.giftInvoker.deleteGift(id);
  }
}
