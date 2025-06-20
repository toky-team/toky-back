import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min, ValidateIf } from 'class-validator';

import { Sport } from '~/libs/enums/sport';

export class GetMessagesRequestDto {
  @ApiProperty({
    description: '조회 커서',
    required: false,
  })
  @ValidateIf((o: GetMessagesRequestDto) => o.cursor !== undefined)
  @IsString()
  @IsNotEmpty()
  cursor?: string;

  @ApiProperty({
    description: '조회 개수',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  limit: number;

  @ApiProperty({
    description: '스포츠 종류',
    enum: Sport,
  })
  @IsNotEmpty()
  @IsEnum(Sport)
  sport: Sport;
}
