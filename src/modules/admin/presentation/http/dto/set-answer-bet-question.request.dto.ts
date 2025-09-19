import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min, ValidateIf, ValidateNested } from 'class-validator';

import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';

export class ScoreAnswerRequestDto {
  @ApiProperty({
    description: '고려대학교 점수',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  kuScore: number;

  @ApiProperty({
    description: '연세대학교 점수',
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  yuScore: number;
}

export class PredictAnswerRequestDto {
  @ApiProperty({
    description: '경기 결과',
    example: MatchResult.KOREA_UNIVERSITY,
    enum: MatchResult,
  })
  @IsNotEmpty()
  @IsEnum(MatchResult)
  matchResult: MatchResult;

  @ApiProperty({
    description: '점수',
    type: ScoreAnswerRequestDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ScoreAnswerRequestDto)
  score: ScoreAnswerRequestDto;
}

export class PlayerAnswerRequestDto {
  @ApiProperty({
    description: '선수 ID 배열',
    example: ['550e8400-e29b-41d4-a716-446655440002'],
  })
  @IsUUID(undefined, { each: true })
  playerId: string[];
}

export class AnswerRequestDto {
  @ApiProperty({
    description: '예측 정답',
    type: PredictAnswerRequestDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PredictAnswerRequestDto)
  predict: PredictAnswerRequestDto;

  @ApiProperty({
    description: '고려대학교 선수 정답',
    type: PlayerAnswerRequestDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlayerAnswerRequestDto)
  kuPlayer: PlayerAnswerRequestDto;

  @ApiProperty({
    description: '연세대학교 선수 정답',
    type: PlayerAnswerRequestDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlayerAnswerRequestDto)
  yuPlayer: PlayerAnswerRequestDto;
}

export class SetAnswerBetQuestionRequestDto {
  @ApiProperty({
    description: '경기 종목',
    example: Sport.FOOTBALL,
    enum: Sport,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '질문 정답',
    type: AnswerRequestDto,
    nullable: true,
  })
  @ValidateIf((o: SetAnswerBetQuestionRequestDto) => o.answer !== null)
  @ValidateNested()
  @Type(() => AnswerRequestDto)
  answer: AnswerRequestDto | null;
}
