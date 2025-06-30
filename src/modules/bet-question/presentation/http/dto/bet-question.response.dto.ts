import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export class BetQuestionResponseDto {
  @ApiProperty({
    description: '질문 ID',
  })
  id: string;

  @ApiProperty({
    description: '경기 종목',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '질문 순서',
  })
  order: number;

  @ApiProperty({
    description: '질문 내용',
  })
  question: string;

  @ApiProperty({
    description: '질문 옵션',
  })
  options: string[];

  @ApiProperty({
    description: '선택지 개수(2 or 3)',
  })
  optionsCount: number;

  static fromPrimitives(primitives: BetQuestionPrimitives): BetQuestionResponseDto {
    return {
      id: primitives.id,
      sport: primitives.sport,
      order: primitives.order,
      question: primitives.question,
      options: primitives.options,
      optionsCount: primitives.options.length,
    };
  }
}
