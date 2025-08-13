import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UpdateBetQuestionRequestDto } from '~/modules/admin/presentation/http/dto/update-bet-question.request.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { BetQuestionInvoker } from '~/modules/bet-question/application/port/in/bet-question-invoker.port';
import { BetQuestionResponseDto } from '~/modules/bet-question/presentation/http/dto/bet-question.response.dto';

@Controller('/admin/bet-question')
@ApiTags('BetQuestion')
@UseGuards(AdminGuard)
export class BetQuestionAdminController {
  constructor(private readonly betQuestionInvoker: BetQuestionInvoker) {}

  @Patch('/')
  @ApiOperation({
    summary: '베팅 질문 수정',
    description: '베팅 질문을 수정합니다.',
  })
  @ApiBody({
    description: '수정할 베팅 질문 정보',
    type: UpdateBetQuestionRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '베팅 질문 수정 성공',
    type: BetQuestionResponseDto,
  })
  async updateBetQuestion(@Body() dto: UpdateBetQuestionRequestDto): Promise<BetQuestionResponseDto> {
    const updatedQuestion = await this.betQuestionInvoker.updateQuestion(dto.sport, dto.question, dto.positionFilter);
    return BetQuestionResponseDto.fromPrimitives(updatedQuestion);
  }
}
