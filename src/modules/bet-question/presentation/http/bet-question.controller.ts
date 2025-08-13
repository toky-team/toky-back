import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionFacade } from '~/modules/bet-question/application/port/in/bet-question-facade.port';
import { BetQuestionResponseDto } from '~/modules/bet-question/presentation/http/dto/bet-question.response.dto';

@Controller('bet-question')
export class BetQuestionController {
  constructor(private readonly betQuestionFacade: BetQuestionFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '종목 별 베팅 질문 조회',
    description: '특정 종목에 대한 베팅 질문을 조회합니다.',
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
    description: '종목 별 베팅 질문 조회 성공',
    type: BetQuestionResponseDto,
  })
  @Public()
  async getQuestionsBySport(@Query('sport') sport: Sport): Promise<BetQuestionResponseDto> {
    const question = await this.betQuestionFacade.findBySport(sport);
    return BetQuestionResponseDto.fromPrimitives(question);
  }

  @Get('/all')
  @ApiOperation({
    summary: '모든 베팅 질문 조회',
    description: '모든 종목의 베팅 질문을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '모든 베팅 질문 조회 성공',
    type: [BetQuestionResponseDto],
  })
  @Public()
  async getAllQuestions(): Promise<BetQuestionResponseDto[]> {
    const questions = await this.betQuestionFacade.findAll();
    return questions.map((question) => BetQuestionResponseDto.fromPrimitives(question));
  }
}
