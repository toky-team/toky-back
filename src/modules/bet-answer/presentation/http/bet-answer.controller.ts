import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { BetAnswerFacade } from '~/modules/bet-answer/application/port/in/bet-answer-facade.port';
import { BetAnswerResponseDto } from '~/modules/bet-answer/presentation/http/dto/bet-answer.response.dto';
import { BetAnswerRequestDto } from '~/modules/bet-answer/presentation/http/dto/create-bet-answer.request.dto';
import { MatchResultRatioResponseDto } from '~/modules/bet-answer/presentation/http/dto/match-result-ratio.response.dto';

@Controller('bet-answer')
export class BetAnswerController {
  constructor(private readonly betAnswerFacade: BetAnswerFacade) {}

  @Post('/')
  @ApiOperation({
    summary: '베팅 답변 생성/수정',
    description:
      '사용자의 베팅 답변을 생성하거나 수정합니다. 사용자당 각 종목별로 하나의 답변만 가능합니다. MatchResult와 Score 중 하나만 제공해야 합니다.',
  })
  @ApiBody({
    description: '베팅 답변 생성/수정 요청',
    type: BetAnswerRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '베팅 답변 생성/수정 성공',
    type: BetAnswerResponseDto,
  })
  async createOrUpdateBetAnswer(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BetAnswerRequestDto
  ): Promise<BetAnswerResponseDto> {
    const { user } = req;
    const { sport, predict, player } = dto;

    const betAnswer = await this.betAnswerFacade.createOrUpdateBetAnswer(user.userId, sport, predict, player);
    return BetAnswerResponseDto.fromPrimitives(betAnswer);
  }

  @Get('/')
  @ApiOperation({
    summary: '내 베팅 답변 목록 조회',
    description: '로그인한 사용자의 모든 베팅 답변을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '베팅 답변 목록 조회 성공',
    type: [BetAnswerResponseDto],
  })
  async getMyBetAnswers(@Req() req: AuthenticatedRequest): Promise<BetAnswerResponseDto[]> {
    const { user } = req;
    const betAnswers = await this.betAnswerFacade.getBetAnswersByUserId(user.userId);
    return betAnswers.map((betAnswer) => BetAnswerResponseDto.fromPrimitives(betAnswer));
  }

  @Get('/:sport')
  @ApiOperation({
    summary: '특정 종목 베팅 답변 조회',
    description: '로그인한 사용자의 특정 종목에 대한 베팅 답변을 조회합니다.',
  })
  @ApiParam({
    name: 'sport',
    description: '스포츠 종목',
    enum: Sport,
  })
  @ApiResponse({
    status: 200,
    description: '베팅 답변 조회 성공',
    type: BetAnswerResponseDto,
  })
  async getBetAnswerBySport(
    @Req() req: AuthenticatedRequest,
    @Param('sport') sport: Sport
  ): Promise<BetAnswerResponseDto> {
    const { user } = req;
    const betAnswer = await this.betAnswerFacade.getBetAnswerByUserIdAndSport(user.userId, sport);
    return BetAnswerResponseDto.fromPrimitives(betAnswer);
  }

  @Get('/ratio/:sport')
  @ApiOperation({
    summary: '특정 종목 경기 결과 예측 비율 조회',
    description: '특정 종목에 대한 모든 사용자들의 경기 결과 예측 비율을 조회합니다.',
  })
  @ApiParam({
    name: 'sport',
    description: '스포츠 종목',
    enum: Sport,
  })
  @ApiResponse({
    status: 200,
    description: '경기 결과 예측 비율 조회 성공',
    type: MatchResultRatioResponseDto,
  })
  @Public()
  async getMatchResultRatio(@Param('sport') sport: Sport): Promise<MatchResultRatioResponseDto> {
    const ratio = await this.betAnswerFacade.getMatchResultRatioBySport(sport);
    return MatchResultRatioResponseDto.fromResult(ratio);
  }
}
