import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export class BetQuestionResponseDto {
  @ApiProperty({
    description: '경기 종목',
  })
  sport: Sport;

  @ApiProperty({
    description: '질문 내용',
  })
  question: string;

  @ApiProperty({
    description: '포지션 필터(후보 선수 목록 필터링)',
    type: String,
    nullable: true,
  })
  positionFilter: string | null;

  static fromPrimitives(primitives: BetQuestionPrimitives): BetQuestionResponseDto {
    const dto = new BetQuestionResponseDto();
    dto.sport = primitives.sport;
    dto.question = primitives.question;
    dto.positionFilter = primitives.positionFilter;
    return dto;
  }
}
