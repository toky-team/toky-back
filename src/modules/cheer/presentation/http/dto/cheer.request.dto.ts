import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { University } from '~/libs/enums/university';

export class CheerRequestDto {
  @ApiProperty({
    description: '응원하는 대학교',
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;
}
