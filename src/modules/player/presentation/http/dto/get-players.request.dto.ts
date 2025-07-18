import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

export class GetPlayersRequestQueryDto {
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
    description: '포지션',
    example: 'MF',
    required: false,
  })
  @IsOptional()
  @IsString()
  position?: string;
}
