import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';
import { BetQuestionResponseDto } from '~/modules/bet-question/presentation/http/dto/bet-question.response.dto';

type RequiredSportQuestions = {
  [K in Sport]: BetQuestionResponseDto[];
};

export class QuestionBySportDto implements RequiredSportQuestions {
  @ApiProperty({
    description: '축구 질문 목록',
    type: [BetQuestionResponseDto],
  })
  [Sport.FOOTBALL]: BetQuestionResponseDto[];

  @ApiProperty({
    description: '농구 질문 목록',
    type: [BetQuestionResponseDto],
  })
  [Sport.BASKETBALL]: BetQuestionResponseDto[];

  @ApiProperty({
    description: '야구 질문 목록',
    type: [BetQuestionResponseDto],
  })
  [Sport.BASEBALL]: BetQuestionResponseDto[];

  @ApiProperty({
    description: '럭비 질문 목록',
    type: [BetQuestionResponseDto],
  })
  [Sport.RUGBY]: BetQuestionResponseDto[];

  @ApiProperty({
    description: '아이스하키 질문 목록',
    type: [BetQuestionResponseDto],
  })
  [Sport.ICE_HOCKEY]: BetQuestionResponseDto[];

  static fromPrimitives(primitives: BetQuestionPrimitives[]): QuestionBySportDto {
    const dto = new QuestionBySportDto();
    Object.values(Sport).forEach((sport) => {
      dto[sport] = [];
    });

    primitives.forEach((question) => {
      const responseDto = BetQuestionResponseDto.fromPrimitives(question);
      dto[question.sport].push(responseDto);
    });

    return dto;
  }
}
