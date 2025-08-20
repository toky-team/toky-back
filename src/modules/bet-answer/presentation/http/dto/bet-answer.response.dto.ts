import { ApiProperty } from '@nestjs/swagger';

import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { BetAnswerPrimitives } from '~/modules/bet-answer/domain/model/bet-answer';

export class ScorePredictResponseDto {
  @ApiProperty({
    description: '고려대학교 점수 예측',
    example: 2,
  })
  kuScore: number;

  @ApiProperty({
    description: '연세대학교 점수 예측',
    example: 1,
  })
  yuScore: number;
}

export class MatchPredictResponseDto {
  @ApiProperty({
    description: '경기 결과 예측',
    enum: MatchResult,
  })
  matchResult: MatchResult | undefined;

  @ApiProperty({
    description: '점수 예측',
    type: ScorePredictResponseDto,
    nullable: true,
  })
  score: ScorePredictResponseDto | undefined;
}

export class PlayerPredictResponseDto {
  @ApiProperty({
    description: '고려대학교 선수 ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  kuPlayerId: string | null;

  @ApiProperty({
    description: '연세대학교 선수 ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  yuPlayerId: string | null;
}

export class BetAnswerResponseDto {
  @ApiProperty({
    description: '스포츠 종목',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description: '예측 정보',
    type: MatchPredictResponseDto,
  })
  predict: MatchPredictResponseDto;

  @ApiProperty({
    description: '선수 예측',
    type: PlayerPredictResponseDto,
  })
  player: PlayerPredictResponseDto;

  static fromPrimitives(primitives: BetAnswerPrimitives): BetAnswerResponseDto {
    const dto = new BetAnswerResponseDto();
    dto.sport = primitives.sport;
    dto.predict =
      primitives.predict.score !== null
        ? {
            matchResult: undefined,
            score: primitives.predict.score,
          }
        : {
            matchResult: primitives.predict.matchResult,
            score: undefined,
          };
    dto.player = primitives.player;
    return dto;
  }
}
