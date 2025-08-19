import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { LikeFacade } from '~/modules/like/application/port/in/like-facade.port';
import { LikeResponseDto } from '~/modules/like/presentation/http/dto/like.response.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeFacade: LikeFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '좋아요 조회',
    description: '특정 스포츠의 좋아요 데이터를 조회합니다.',
  })
  @ApiQuery({
    name: 'sport',
    description: '스포츠 종류',
    required: true,
    enum: Sport,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 데이터 조회 성공',
    type: LikeResponseDto,
  })
  @Public()
  async getLike(@Query('sport') sport: Sport): Promise<LikeResponseDto> {
    const likeData = await this.likeFacade.getLike(sport);
    return LikeResponseDto.fromPrimitives(likeData);
  }
}
