import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Sport } from '~/libs/enums/sport';

export class SetLeagueImageRequestDto {
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
    example: 'K리그',
  })
  @IsNotEmpty()
  @IsString()
  league: string;
}

export class SetLeagueImageWithImageDto extends SetLeagueImageRequestDto {
  @ApiPropertyOptional({
    description: '리그 이미지',
    type: 'string',
    format: 'binary',
    nullable: true,
  })
  image: Express.Multer.File | null;
}
