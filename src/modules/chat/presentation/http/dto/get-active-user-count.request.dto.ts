import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { Sport } from '~/libs/enums/sport';

export class GetActiveUserCountRequestDto {
  @ApiProperty({
    description: '조회 할 경기 종목',
    enum: Sport,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;
}
