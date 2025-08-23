import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

export class PredictPlayerRequestDto {
  @ApiProperty({
    description: '스포츠 종목',
    enum: Sport,
    example: Sport.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '대학교',
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;

  @ApiProperty({
    description: '선수 ID, "선수 없음" 을 선택한 경우 null',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  @ValidateIf((o: PredictPlayerRequestDto) => o.playerId !== null)
  @IsUUID()
  playerId: string | null;
}
