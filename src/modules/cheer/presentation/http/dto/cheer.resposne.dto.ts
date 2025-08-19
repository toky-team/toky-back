import { ApiProperty } from '@nestjs/swagger';

import { University } from '~/libs/enums/university';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export class CheerResponseDto {
  @ApiProperty({
    description: '유저 ID',
  })
  userId: string;

  @ApiProperty({
    description: '응원하는 대학교',
  })
  university: University;

  public static fromPrimitives(primitives: CheerPrimitives): CheerResponseDto {
    const dto = new CheerResponseDto();
    dto.userId = primitives.userId;
    dto.university = primitives.university;
    return dto;
  }
}
