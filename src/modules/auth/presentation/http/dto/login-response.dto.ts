import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: '사용자 회원가입 여부(false 시 회원가입 필요)',
  })
  isRegistered: boolean;
}
