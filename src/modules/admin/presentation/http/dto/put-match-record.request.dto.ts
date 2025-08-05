import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

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

class UniversityStatsRequestDto {
  @ApiProperty({
    description: '대학',
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;

  @ApiProperty({
    description: '대학 통계 (key-value 형태)',
    example: {
      승: '7',
      무: '2',
      패: '1',
      승률: '70%',
      득점: '25',
      실점: '8',
    },
  })
  @IsObject()
  stats: Record<string, string>;
}

class PlayerRequestDto {
  @ApiProperty({
    description: '선수 이름',
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
    description: '포지션 (선택사항)',
    example: 'FW',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  position: string | null;

  @ApiProperty({
    description: '선수 통계 (key-value 형태)',
    example: {
      득점: '12',
      도움: '5',
      출전: '10경기',
      평점: '8.5',
    },
  })
  @IsObject()
  stats: Record<string, string>;
}

class PlayerStatsWithCategoryRequestDto {
  @ApiProperty({
    description: '선수 카테고리',
    example: '공격수',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: '해당 카테고리의 선수 목록',
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
    example: Sport.FOOTBALL,
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
    description: '대학별 통계',
    type: [UniversityStatsRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UniversityStatsRequestDto)
  universityStats: UniversityStatsRequestDto[];

  @ApiProperty({
    description: '카테고리별 선수 통계',
    type: [PlayerStatsWithCategoryRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => PlayerStatsWithCategoryRequestDto)
  playerStatsWithCategory: PlayerStatsWithCategoryRequestDto[];
}

export class PutMatchRecordRequestDto {
  @ApiProperty({
    description: '전적 정보 목록',
    type: [MatchRecordRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => MatchRecordRequestDto)
  records: MatchRecordRequestDto[];
}
