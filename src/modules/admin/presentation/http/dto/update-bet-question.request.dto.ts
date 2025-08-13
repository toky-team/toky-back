import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

import { Sport } from '~/libs/enums/sport';

export class UpdateBetQuestionRequestDto {
  @ApiProperty({
    description: '경기 종목',
    example: Sport.FOOTBALL,
    enum: Sport,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '질문 내용',
    example: '이 경기는 누가 이길까요?',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    description: '포지션 필터',
    example: '투수',
    nullable: true,
  })
  @ValidateIf((o: UpdateBetQuestionRequestDto) => o.positionFilter !== null)
  @IsString()
  positionFilter: string | null;
}
