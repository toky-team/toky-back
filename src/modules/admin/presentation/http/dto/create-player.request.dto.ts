import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

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
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  birth: string;

  @ApiProperty({
    description: '키 (cm 단위)',
    example: 180,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(300)
  @Min(0)
  height: number;

  @ApiProperty({
    description: '몸무게 (kg 단위)',
    example: 80,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(200)
  @Min(0)
  weight: number;

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
}

export class CreatePlayerWithImageDto extends CreatePlayerRequestDto {
  @ApiProperty({
    description: '선수 이미지 (JPG, PNG, WEBP만 허용, 최대 5MB)',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;
}
