import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { likeInvoker } from '~/modules/like/application/port/in/like-invoker.port';
import { LikeResponseDto } from '~/modules/like/presentation/http/dto/like.response.dto';

@Controller('/admin/like')
@ApiTags('Like')
@UseGuards(AdminGuard)
export class LikeAdminController {
  constructor(private readonly likeInvoker: likeInvoker) {}

  @Post('/reset')
  @ApiOperation({
    summary: '좋아요 초기화',
    description: '특정 종목의 좋아요값을 초기화합니다.',
  })
  @ApiQuery({
    name: 'sport',
    description: '스포츠 종류',
    required: true,
    enum: Sport,
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: '좋아요 초기화 성공',
    type: LikeResponseDto,
  })
  async resetLike(@Query('sport') sport: Sport): Promise<LikeResponseDto> {
    const like = await this.likeInvoker.resetLike(sport);
    return LikeResponseDto.fromPrimitives(like);
  }
}
