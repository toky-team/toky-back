import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { University } from '~/libs/enums/university';

export class RegisterRequestDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: '사용자 전화번호',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  phoneNumber: string;

  @ApiProperty({
    description: '사용자 대학',
    enum: University,
    example: University.KOREA_UNIVERSITY,
  })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;
}
