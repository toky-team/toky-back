import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { MatchRecordFacade } from '~/modules/match-record/application/port/in/match-record-facade.port';
import {
  GetMatchRecordRequestQueryDto,
  GetMatchRecordsRequestQueryDto,
} from '~/modules/match-record/presentation/http/dto/get-match-records.request.dto';
import { MatchRecordResponseDto } from '~/modules/match-record/presentation/http/dto/match-record.response.dto';
import { PlayerMatchRecordResponseDto } from '~/modules/match-record/presentation/http/dto/player-match-record.response.dto';

@Controller('match-record')
export class MatchRecordController {
  constructor(private readonly matchRecordFacade: MatchRecordFacade) {}

  @Get('/')
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
  async getMatchRecordsBySport(@Query() query: GetMatchRecordsRequestQueryDto): Promise<MatchRecordResponseDto[]> {
    const records = await this.matchRecordFacade.getMatchRecordsBySport(query.sport);
    return records.map((record) => MatchRecordResponseDto.fromPrimitives(record));
  }

  @Get('/league')
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
  async getMatchRecord(@Query() query: GetMatchRecordRequestQueryDto): Promise<MatchRecordResponseDto> {
    const record = await this.matchRecordFacade.getMatchRecord(query.sport, query.league);
    return MatchRecordResponseDto.fromPrimitives(record);
  }

  @Get('/player/:id')
  @ApiOperation({
    summary: '선수별 전적 정보 조회',
    description: '특정 선수의 전적 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전적 정보 조회 성공',
    type: PlayerMatchRecordResponseDto,
  })
  @Public()
  async getPlayerMatchRecord(@Param('id') playerId: string): Promise<PlayerMatchRecordResponseDto> {
    const record = await this.matchRecordFacade.getPlayerMatchRecord(playerId);
    return PlayerMatchRecordResponseDto.fromResult(record);
  }
}
