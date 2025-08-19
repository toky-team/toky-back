import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateLiveUrlRequestDto } from '~/modules/admin/presentation/http/dto/create-live-url.request.dto';
import { UpdateLiveUrlRequestDto } from '~/modules/admin/presentation/http/dto/update-live-url.request.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { LiveUrlInvoker } from '~/modules/live-url/application/port/in/live-url-invoker.port';
import { LiveUrlResponseDto } from '~/modules/live-url/presentation/http/dto/live-url.response.dto';

@Controller('admin/live-url')
@ApiTags('LiveUrl')
@UseGuards(AdminGuard)
export class LiveUrlAdminController {
  constructor(private readonly liveUrlInvoker: LiveUrlInvoker) {}

  @Post('/')
  @ApiOperation({
    summary: '라이브 URL 생성',
    description: '새로운 라이브 URL을 생성합니다.',
  })
  @ApiBody({
    type: CreateLiveUrlRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '라이브 URL이 성공적으로 생성되었습니다.',
    type: LiveUrlResponseDto,
  })
  async createLiveUrl(@Body() body: CreateLiveUrlRequestDto): Promise<LiveUrlResponseDto> {
    const createdUrl = await this.liveUrlInvoker.createLiveUrl(body.sport, body.broadcastName, body.url);
    return LiveUrlResponseDto.fromPrimitives(createdUrl);
  }

  @Patch('/:id')
  @ApiOperation({
    summary: '라이브 URL 수정',
    description: '기존의 라이브 URL을 수정합니다.',
  })
  @ApiBody({
    type: UpdateLiveUrlRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '라이브 URL이 성공적으로 수정되었습니다.',
    type: LiveUrlResponseDto,
  })
  async updateLiveUrl(@Param('id') id: string, @Body() body: UpdateLiveUrlRequestDto): Promise<LiveUrlResponseDto> {
    const updatedUrl = await this.liveUrlInvoker.updateLiveUrl(id, body.broadcastName, body.url);
    return LiveUrlResponseDto.fromPrimitives(updatedUrl);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '라이브 URL 삭제',
    description: '기존의 라이브 URL을 삭제합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '라이브 URL이 성공적으로 삭제되었습니다.',
  })
  async deleteLiveUrl(@Param('id') id: string): Promise<void> {
    await this.liveUrlInvoker.deleteLiveUrl(id);
  }
}
