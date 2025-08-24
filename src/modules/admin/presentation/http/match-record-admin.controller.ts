import { Body, Controller, Patch, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  PutMatchRecordRequestDto,
  PutMatchRecordsRequestQueryDto,
} from '~/modules/admin/presentation/http/dto/put-match-record.request.dto';
import {
  SetLeagueImageRequestDto,
  SetLeagueImageWithImageDto,
} from '~/modules/admin/presentation/http/dto/set-league-image.request.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { MatchRecordInvoker } from '~/modules/match-record/application/port/in/match-record-invoker.port';
import { MatchRecordResponseDto } from '~/modules/match-record/presentation/http/dto/match-record.response.dto';

@Controller('admin/match-record')
@ApiTags('MatchRecord')
@UseGuards(AdminGuard)
export class MatchRecordAdminController {
  constructor(private readonly matchRecordInvoker: MatchRecordInvoker) {}

  @Put('/')
  @ApiOperation({
    summary: '전적 수정',
    description: '특정 종목의 전적을 수정합니다.',
  })
  @ApiBody({
    type: PutMatchRecordRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '전적 수정 성공',
    type: [MatchRecordResponseDto],
  })
  async updateMatchRecords(
    @Query() query: PutMatchRecordsRequestQueryDto,
    @Body() body: PutMatchRecordRequestDto
  ): Promise<MatchRecordResponseDto[]> {
    const updatedRecords = await this.matchRecordInvoker.updateMatchRecordsBySport(query.sport, body.records);
    return updatedRecords.map((record) => MatchRecordResponseDto.fromPrimitives(record));
  }

  @Patch('/image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '리그 이미지 수정',
    description: '특정 종목의 리그 이미지를 수정합니다.',
  })
  @ApiBody({
    type: SetLeagueImageWithImageDto,
  })
  @ApiResponse({
    status: 200,
    description: '리그 이미지 수정 성공',
    type: MatchRecordResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async updateLeagueImage(
    @Body() body: SetLeagueImageRequestDto,
    @UploadedFile() image: Express.Multer.File | null
  ): Promise<MatchRecordResponseDto> {
    const updatedRecord = await this.matchRecordInvoker.setLeagueImage(body.sport, body.league, image);
    return MatchRecordResponseDto.fromPrimitives(updatedRecord);
  }
}
