import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { ScoreFacade } from '~/modules/score/application/port/in/score-facade.port';
import { ScoreResponseDto } from '~/modules/score/presentation/http/dto/score.response.dto';
import { ScoreUpdateRequestDto } from '~/modules/score/presentation/http/dto/score-update.request.dto';

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

  @Post('/start')
  @ApiOperation({
    summary: '경기 시작',
    description: '특정 스포츠를 시작합니다.',
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
    description: '경기 시작 성공',
  })
  @Public()
  async startGame(@Query('sport') sport: Sport): Promise<void> {
    await this.scoreFacade.startGame(sport);
  }

  @Post('/end')
  @ApiOperation({
    summary: '경기 종료',
    description: '특정 스포츠를 종료합니다.',
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
    description: '경기 종료 성공',
  })
  @Public()
  async endGame(@Query('sport') sport: Sport): Promise<void> {
    await this.scoreFacade.endGame(sport);
  }

  @Post('/reset')
  @ApiOperation({
    summary: '경기 리셋',
    description: '특정 스포츠를 리셋합니다.',
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
    description: '경기 리셋 성공',
  })
  @Public()
  async resetGame(@Query('sport') sport: Sport): Promise<void> {
    await this.scoreFacade.resetScore(sport);
  }

  @Post('/update')
  @ApiOperation({
    summary: '경기 점수 업데이트',
    description: '특정 스포츠의 점수를 업데이트합니다.',
  })
  @ApiQuery({
    name: 'sport',
    description: '스포츠 종류',
    required: true,
    enum: Sport,
    type: String,
  })
  @ApiBody({
    description: '업데이트할 점수 정보',
    type: ScoreUpdateRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '경기 점수 업데이트 성공',
  })
  @Public()
  async updateGame(@Query('sport') sport: Sport, @Body() dto: ScoreUpdateRequestDto): Promise<void> {
    await this.scoreFacade.updateScore(sport, dto.kuScore, dto.yuScore);
  }
}
