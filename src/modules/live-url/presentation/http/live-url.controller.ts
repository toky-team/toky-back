import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { LiveUrlFacade } from '~/modules/live-url/application/port/in/live-url-facade.port';
import { LiveUrlResponseDto } from '~/modules/live-url/presentation/http/dto/live-url.response.dto';

@Controller('live-url')
export class LiveUrlController {
  constructor(private readonly liveUrlFacade: LiveUrlFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '라이브 URL 리스트 조회',
    description: '특정 스포츠의 라이브 URL들을 조회합니다.',
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
    description: '성공적으로 라이브 URL을 조회했습니다.',
    type: [LiveUrlResponseDto],
  })
  @Public()
  async getLiveUrlsBySport(@Query('sport') sport: Sport): Promise<LiveUrlResponseDto[]> {
    const liveUrls = await this.liveUrlFacade.getLiveUrlsBySport(sport);
    return liveUrls.map((liveUrl) => LiveUrlResponseDto.fromPrimitives(liveUrl));
  }
}
