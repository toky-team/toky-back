import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionFacade } from '~/modules/bet-question/application/port/in/bet-question-facade.port';
import { BetQuestionResponseDto } from '~/modules/bet-question/presentation/http/dto/bet-question.response.dto';
import { QuestionBySportDto } from '~/modules/bet-question/presentation/http/dto/question-by-sport.dto';

@Controller('bet-question')
export class BetQuestionController {
  constructor(private readonly betQuestionFacade: BetQuestionFacade) {}

  @Get('/all')
  @ApiOperation({
    summary: '모든 베팅 질문 조회',
    description: '모든 베팅 질문을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '모든 베팅 질문 조회 성공',
    type: QuestionBySportDto,
  })
  @Public()
  async getAllQuestions(): Promise<QuestionBySportDto> {
    const questions = await this.betQuestionFacade.findAll();
    return QuestionBySportDto.fromPrimitives(questions);
  }

  @Get('/')
  @ApiOperation({
    summary: '종목 별 베팅 질문 조회',
    description: '종목 별로 베팅 질문을 조회합니다.',
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
    type: [BetQuestionResponseDto],
  })
  @Public()
  async getQuestionsBySport(@Query('sport') sport: Sport): Promise<BetQuestionResponseDto[]> {
    const questions = await this.betQuestionFacade.findBySport(sport);
    return questions.map((question) => BetQuestionResponseDto.fromPrimitives(question));
  }
}
