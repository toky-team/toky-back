import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { University } from '~/libs/enums/university';

export class UpdateUserRequestDto {
  @ApiPropertyOptional({
    description: '사용자 이름',
    required: false,
    example: '홍길동',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @ApiPropertyOptional({
    description: '전화번호',
    required: false,
    example: '010-1234-5678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: '대학교',
    required: false,
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsOptional()
  @IsEnum(University)
  university?: University;
}
