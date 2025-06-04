import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class KopasLoginRequestDto {
  @ApiProperty({
    description: '고파스 아이디',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  id: string;

  @ApiProperty({
    description: '고파스 비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  password: string;
}
