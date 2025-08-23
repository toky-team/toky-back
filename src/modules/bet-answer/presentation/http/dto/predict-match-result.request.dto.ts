import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';

import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';

export class ScorePredictRequestDto {
  @ApiProperty({
    description: '고려대학교 점수',
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  kuScore: number;

  @ApiProperty({
    description: '연세대학교 점수',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  yuScore: number;
}

export class MatchPredictRequestDto {
  @ApiPropertyOptional({
    description: '경기 결과 예측',
    enum: MatchResult,
  })
  @IsOptional()
  @IsEnum(MatchResult)
  matchResult?: MatchResult;

  @ApiPropertyOptional({
    description: '점수 예측',
    type: ScorePredictRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScorePredictRequestDto)
  score?: ScorePredictRequestDto;
}

export class PredictMatchResultRequestDto {
  @ApiProperty({
    description: '스포츠 종목',
    enum: Sport,
    example: Sport.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '예측 정보,  반드시 [경기 결과, 경기 점수] 중 하나만 포함해야 합니다.',
    type: MatchPredictRequestDto,
  })
  @ValidateNested()
  @Type(() => MatchPredictRequestDto)
  predict: MatchPredictRequestDto;
}
