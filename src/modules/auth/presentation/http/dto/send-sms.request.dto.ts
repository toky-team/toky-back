import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendSmsRequestDto {
  @ApiProperty({
    description: '사용자 전화번호',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  phoneNumber: string;
}
