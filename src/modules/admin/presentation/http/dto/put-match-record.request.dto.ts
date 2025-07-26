import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsString, Max, Min, ValidateNested } from 'class-validator';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

export class PutMatchRecordsRequestParamDto {
  @ApiProperty({
    description: '종목',
    enum: Sport,
    example: Sport.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;
}

class UniversityRankingRequestDto {
  @ApiProperty({
    description: '대학 순위',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  rank: number;

  @ApiProperty({
    description: '대학',
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;

  @ApiProperty({
    description: '경기 수',
    example: 10,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  matchCount: number;

  @ApiProperty({
    description: '승리 수',
    example: 7,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  winCount: number;

  @ApiProperty({
    description: '무승부 수',
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  drawCount: number;

  @ApiProperty({
    description: '패배 수',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  loseCount: number;

  @ApiProperty({
    description: '승률',
    example: 0.7,
  })
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  winRate: number;
}

class PlayerRequestDto {
  @ApiProperty({
    description: '선수 순위',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  rank: number;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '소속 대학',
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;

  @ApiProperty({
    description: '포지션',
    example: 'MF',
  })
  @IsString()
  position: string;

  @ApiProperty({
    description: '통계',
    example: {
      득점: 10,
      도움: 5,
      파울: 15,
      출전경기: 20,
    },
  })
  @IsObject()
  stats: Record<string, number>;
}

class PlayerRankingRequestDto {
  @ApiProperty({
    description: '카테고리',
    example: '투수',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: '선수 목록',
    type: [PlayerRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => PlayerRequestDto)
  players: PlayerRequestDto[];
}

class MatchRecordRequestDto {
  @ApiProperty({
    description: '종목',
    enum: Sport,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '리그 이름',
    example: 'U리그',
  })
  @IsNotEmpty()
  @IsString()
  league: string;

  @ApiProperty({
    description: '대학 순위',
    type: [UniversityRankingRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UniversityRankingRequestDto)
  universityRankings: UniversityRankingRequestDto[];

  @ApiProperty({
    description: '선수 순위',
    type: [PlayerRankingRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => PlayerRankingRequestDto)
  playerRankings: PlayerRankingRequestDto[];
}

export class PutMatchRecordRequestDto {
  @ApiProperty({
    description: '전적 정보',
    type: [MatchRecordRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => MatchRecordRequestDto)
  records: MatchRecordRequestDto[];
}
