import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
    example: '고려대학교',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  university: string;
}
