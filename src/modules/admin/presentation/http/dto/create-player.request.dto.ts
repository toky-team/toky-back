import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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

export class CreatePlayerRequestDto {
  @ApiProperty({
    description: '선수 이름',
    example: '홍길동',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
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
    description: '종목',
    enum: Sport,
    example: Sport.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '학과',
    example: '체육교육학과 21',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  department: string;

  @ApiProperty({
    description: '생년월일 (YYYY.MM.DD 형식)',
    example: '2002.04.30',
    nullable: true,
  })
  @Transform(({ value }): string | null => (value === undefined || value === '' || value === 'null' ? null : value))
  @IsOptional()
  @IsString()
  @MaxLength(10)
  birth: string | null;

  @ApiProperty({
    description: '키 (cm 단위)',
    example: 180,
    nullable: true,
  })
  @Transform(({ value }): number | null =>
    value === undefined || value === '' || value === 'null' ? null : Number(value)
  )
  @IsOptional()
  @IsNumber()
  @Max(300)
  @Min(0)
  height: number | null;

  @ApiProperty({
    description: '몸무게 (kg 단위)',
    example: 80,
    nullable: true,
  })
  @Transform(({ value }): number | null =>
    value === undefined || value === '' || value === 'null' ? null : Number(value)
  )
  @IsOptional()
  @IsNumber()
  @Max(200)
  @Min(0)
  weight: number | null;

  @ApiProperty({
    description: '포지션',
    example: 'MF',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  position: string;

  @ApiProperty({
    description: '등번호',
    example: 8,
  })
  @IsNotEmpty()
  @IsInt()
  @Max(999)
  @Min(0)
  backNumber: number;

  @ApiProperty({
    description: '주요 경력',
    type: [String],
    example: ['고등학교 축구부 주장', '대학 리그 MVP'],
  })
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
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  careers: string[];

  @ApiProperty({
    description: '주요 선수 여부',
    example: true,
  })
  @Transform(({ value }): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
  })
  @IsNotEmpty()
  @IsBoolean()
  isPrimary: boolean;
}

export class CreatePlayerWithImageDto extends CreatePlayerRequestDto {
  @ApiProperty({
    description: '선수 이미지 (JPG, PNG, WEBP만 허용, 최대 5MB)',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;
}
