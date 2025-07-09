import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { ScoreFacade } from '~/modules/score/application/port/in/score-facade.port';
import { EntireScoreResponseDto } from '~/modules/score/presentation/http/dto/entire-score.response.dto';
import { ScoreResponseDto } from '~/modules/score/presentation/http/dto/score.response.dto';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreFacade: ScoreFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '경기 점수 조회',
    description: '특정 스포츠의 점수를 조회합니다.',
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
    description: '경기 점수 조회 성공',
    type: ScoreResponseDto,
  })
  @Public()
  async getScore(@Query('sport') sport: Sport): Promise<ScoreResponseDto> {
    const score = await this.scoreFacade.getScore(sport);
    return ScoreResponseDto.fromPrimitives(score);
  }

  @Get('/entire')
  @ApiOperation({
    summary: '전체 점수 조회',
    description: '정기전 전체 점수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전체 점수 조회 성공',
    type: EntireScoreResponseDto,
  })
  @Public()
  async getEntireScore(): Promise<EntireScoreResponseDto> {
    const entireScore = await this.scoreFacade.getEntireScore();
    return EntireScoreResponseDto.fromResult(entireScore);
  }
}
