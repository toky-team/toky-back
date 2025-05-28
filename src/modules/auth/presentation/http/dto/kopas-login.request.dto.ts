import { ApiProperty } from '@nestjs/swagger';

export class KopasLoginRequestDto {
  @ApiProperty({
    description: '고파스 아이디',
  })
  id: string;

  @ApiProperty({
    description: '고파스 비밀번호',
  })
  password: string;
}
