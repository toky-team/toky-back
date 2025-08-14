import { Body, Controller, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  PutMatchRecordRequestDto,
  PutMatchRecordsRequestQueryDto,
} from '~/modules/admin/presentation/http/dto/put-match-record.request.dto';
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
}
