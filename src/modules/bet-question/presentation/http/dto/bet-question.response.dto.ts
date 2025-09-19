import { ApiProperty } from '@nestjs/swagger';

import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

export class ScoreAnswerDto {
  @ApiProperty({
    description: '고려대학교 점수',
    example: 3,
  })
  kuScore: number;

  @ApiProperty({
    description: '연세대학교 점수',
    example: 2,
  })
  yuScore: number;
}

export class PredictAnswerDto {
  @ApiProperty({
    description: '경기 결과',
    example: MatchResult.KOREA_UNIVERSITY,
    enum: MatchResult,
  })
  matchResult: MatchResult;

  @ApiProperty({
    description: '점수',
    type: ScoreAnswerDto,
  })
  score: ScoreAnswerDto;
}

export class PlayerAnswerDto {
  @ApiProperty({
    description: '선수 ID 배열',
    example: ['550e8400-e29b-41d4-a716-446655440002'],
  })
  playerId: string[];
}

export class AnswerDto {
  @ApiProperty({
    description: '예측 정답',
    type: PredictAnswerDto,
  })
  predict: PredictAnswerDto;

  @ApiProperty({
    description: '고려대학교 선수 정답',
    type: PlayerAnswerDto,
  })
  kuPlayer: PlayerAnswerDto;

  @ApiProperty({
    description: '연세대학교 선수 정답',
    type: PlayerAnswerDto,
  })
  yuPlayer: PlayerAnswerDto;
}

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

  @ApiProperty({
    description: '정답(등록안되어 있을 경우 null)',
    nullable: true,
    type: AnswerDto,
  })
  answer: AnswerDto | null;

  static fromPrimitives(primitives: BetQuestionPrimitives): BetQuestionResponseDto {
    const dto = new BetQuestionResponseDto();
    dto.sport = primitives.sport;
    dto.question = primitives.question;
    dto.positionFilter = primitives.positionFilter;
    dto.answer = primitives.answer;
    return dto;
  }
}
