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
  })
  score: ScorePredictResponseDto | undefined;
}

export class PlayerPredictResponseDto {
  @ApiProperty({
    description: '선수 ID, "선수 없음" 을 선택한 경우 null',
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  playerId: string | null;
}

export class BetAnswerResponseDto {
  @ApiProperty({
    description: '스포츠 종목',
    enum: Sport,
  })
  sport: Sport;

  @ApiProperty({
    description:
      '예측 정보, 아직 예측을 하지 않은 경우 null 이 반환됩니다. [경기 결과, 경기 점수] 중 하나만 반환됩니다.',
    type: MatchPredictResponseDto,
    nullable: true,
  })
  predict: MatchPredictResponseDto | null;

  @ApiProperty({
    description: '고려대학교 선수 예측, 아직 예측을 하지 않은 경우 null 이 반환됩니다.',
    type: PlayerPredictResponseDto,
    nullable: true,
  })
  kuPlayer: PlayerPredictResponseDto | null;

  @ApiProperty({
    description: '연세대학교 선수 예측, 아직 예측을 하지 않은 경우 null 이 반환됩니다.',
    type: PlayerPredictResponseDto,
    nullable: true,
  })
  yuPlayer: PlayerPredictResponseDto | null;

  static fromPrimitives(primitives: BetAnswerPrimitives): BetAnswerResponseDto {
    const dto = new BetAnswerResponseDto();
    dto.sport = primitives.sport;
    dto.predict = primitives.predict
      ? primitives.predict.score
        ? {
            matchResult: undefined,
            score: {
              kuScore: primitives.predict.score.kuScore,
              yuScore: primitives.predict.score.yuScore,
            },
          }
        : {
            matchResult: primitives.predict.matchResult,
            score: undefined,
          }
      : null;
    dto.kuPlayer = primitives.kuPlayer;
    dto.yuPlayer = primitives.yuPlayer;
    return dto;
  }
}
