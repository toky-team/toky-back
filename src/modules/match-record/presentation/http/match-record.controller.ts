import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { MatchRecordFacade } from '~/modules/match-record/application/port/in/match-record-facade.port';
import {
  GetMatchRecordRequestParamDto,
  GetMatchRecordsRequestParamDto,
} from '~/modules/match-record/presentation/http/dto/get-match-records.request.dto';
import { MatchRecordResponseDto } from '~/modules/match-record/presentation/http/dto/match-record.response.dto';

@Controller('match-record')
export class MatchRecordController {
  constructor(private readonly matchRecordFacade: MatchRecordFacade) {}

  @Get('/:sport')
  @ApiOperation({
    summary: '스포츠별 전적 정보 조회',
    description: '특정 스포츠의 전적 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전적 정보 조회 성공',
    type: [MatchRecordResponseDto],
  })
  @Public()
  async getMatchRecordsBySport(@Param() params: GetMatchRecordsRequestParamDto): Promise<MatchRecordResponseDto[]> {
    const records = await this.matchRecordFacade.getMatchRecordsBySport(params.sport);
    return records.map((record) => MatchRecordResponseDto.fromPrimitives(record));
  }

  @Get('/:sport/:league')
  @ApiOperation({
    summary: '스포츠와 리그별 전적 정보 조회',
    description: '특정 스포츠와 리그의 전적 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전적 정보 조회 성공',
    type: MatchRecordResponseDto,
  })
  @Public()
  async getMatchRecord(@Param() params: GetMatchRecordRequestParamDto): Promise<MatchRecordResponseDto> {
    const record = await this.matchRecordFacade.getMatchRecord(params.sport, params.league);
    return MatchRecordResponseDto.fromPrimitives(record);
  }
}
