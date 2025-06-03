import { ApiProperty } from '@nestjs/swagger';

import { UserPrimitives } from '~/modules/user/domain/model/user';

export class UserResponseDto {
  @ApiProperty({
    description: '사용자 ID',
  })
  id: string;

  @ApiProperty({
    description: '사용자 이름',
  })
  name: string;

  @ApiProperty({
    description: '사용자 전화번호',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '사용자 소속 대학',
  })
  university: string;

  @ApiProperty({
    description: '사용자 가입일자',
  })
  createdAt: string;

  static fromPrimitives(primitives: UserPrimitives): UserResponseDto {
    return {
      id: primitives.id,
      name: primitives.name,
      phoneNumber: primitives.phoneNumber,
      university: primitives.university,
      createdAt: primitives.createdAt,
    };
  }
}
