import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Sport } from '~/libs/enums/sport';

export class CreateLiveUrlRequestDto {
  @ApiProperty({
    description: '스포츠 종목',
    enum: Sport,
    example: Sport.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({
    description: '방송사 이름',
    example: 'KUBS',
  })
  @IsNotEmpty()
  @IsString()
  broadcastName: string;

  @ApiProperty({
    description: '방송 URL',
    example: 'https://example.com/live',
  })
  @IsNotEmpty()
  @IsString()
  url: string;
}
