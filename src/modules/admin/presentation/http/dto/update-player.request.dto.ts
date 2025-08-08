import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

export class UpdatePlayerRequestDto {
  @ApiPropertyOptional({
    description: '선수 이름',
    example: '홍길동',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: '소속 대학',
    enum: University,
    example: University.KOREA_UNIVERSITY,
    required: false,
  })
  @IsOptional()
  @IsEnum(University)
  university?: University;

  @ApiPropertyOptional({
    description: '종목',
    enum: Sport,
    example: Sport.FOOTBALL,
    required: false,
  })
  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @ApiPropertyOptional({
    description: '학과',
    example: '체육교육학과 21',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  department?: string;

  @ApiPropertyOptional({
    description: '생년월일 (YYYY.MM.DD 형식)',
    example: '2002.04.30',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  birth?: string;

  @ApiPropertyOptional({
    description: '키 (cm 단위)',
    example: 180,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Max(300)
  @Min(0)
  height?: number;

  @ApiPropertyOptional({
    description: '몸무게 (kg 단위)',
    example: 80,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Max(200)
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: '포지션',
    example: 'MF',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  position?: string;

  @ApiPropertyOptional({
    description: '등번호',
    example: 8,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Max(999)
  @Min(0)
  backNumber?: number;

  @ApiPropertyOptional({
    description: '주요 경력',
    example: ['고등학교 축구부 주장', '대학 리그 MVP'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Ignore JSON parse errors
      }
      return value
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);
    }
    return [];
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  careers?: string[];
}

export class UpdatePlayerWithImageDto extends UpdatePlayerRequestDto {
  @ApiPropertyOptional({
    description: '선수 이미지 (JPG, PNG, WEBP만 허용, 최대 5MB)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File;
}
