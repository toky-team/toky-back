import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Sport } from '~/libs/enums/sport';

export class GetMatchRecordsRequestQueryDto {
  @ApiProperty({
    description: '종목',
    enum: Sport,
    example: Sport.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;
}

export class GetMatchRecordRequestQueryDto extends GetMatchRecordsRequestQueryDto {
  @ApiProperty({
    description: '리그 이름',
    example: 'U리그',
  })
  @IsNotEmpty()
  @IsString()
  league: string;
}
