import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { cheerInvoker } from '~/modules/cheer/application/port/in/cheer-invoker.port';
import { CheerResponseDto } from '~/modules/cheer/presentation/http/dto/cheer.response.dto';

@Controller('/admin/cheer')
@ApiTags('Cheer')
@UseGuards(AdminGuard)
export class CheerAdminController {
  constructor(private readonly cheerInvoker: cheerInvoker) {}

  @Post('/reset')
  @ApiOperation({
    summary: '응원 초기화',
    description: '특정 종목의 응원값을 초기화합니다.',
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
    description: '응원 초기화 성공',
    type: CheerResponseDto,
  })
  async resetCheer(@Query('sport') sport: Sport): Promise<CheerResponseDto> {
    const cheer = await this.cheerInvoker.resetCheer(sport);
    return CheerResponseDto.fromPrimitives(cheer);
  }
}
