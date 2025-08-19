import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { CheerResponseDto } from '~/modules/cheer/presentation/http/dto/cheer.response.dto';

@Controller('cheer')
export class CheerController {
  constructor(private readonly cheerFacade: CheerFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '응원 조회',
    description: '특정 스포츠의 응원 데이터를 조회합니다.',
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
    description: '응원 데이터 조회 성공',
    type: CheerResponseDto,
  })
  @Public()
  async getCheer(@Query('sport') sport: Sport): Promise<CheerResponseDto> {
    const cheerData = await this.cheerFacade.getCheer(sport);
    return CheerResponseDto.fromPrimitives(cheerData);
  }
}
