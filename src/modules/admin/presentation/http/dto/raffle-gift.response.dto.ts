import { ApiProperty } from '@nestjs/swagger';

import { University } from '~/libs/enums/university';
import { RaffleResultDto } from '~/modules/admin/application/dto/raffle-result.dto';

export class RaffleResponseDto {
  @ApiProperty({
    description: '추첨된 응모 ID',
  })
  drawId: string;

  @ApiProperty({
    description: '사용자 ID',
  })
  userId: string;

  @ApiProperty({
    description: '사용자 이름',
  })
  username: string;

  @ApiProperty({
    description: '사용자 전화번호',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '사용자 소속 대학',
    enum: University,
  })
  university: University;

  static fromResult(dto: RaffleResultDto): RaffleResponseDto {
    return {
      drawId: dto.drawId,
      userId: dto.userId,
      username: dto.username,
      phoneNumber: dto.phoneNumber,
      university: dto.university,
    };
  }
}
