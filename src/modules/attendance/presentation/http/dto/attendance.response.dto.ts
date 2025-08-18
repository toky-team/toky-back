import { ApiProperty } from '@nestjs/swagger';

import { AttendancePrimitives } from '~/modules/attendance/domain/model/attendance';

export class AttendanceResponseDto {
  @ApiProperty({
    description: '출석 일시',
    example: '2023-03-15 12:00:00',
  })
  attendandAt: string;

  @ApiProperty({
    description: '출석 성공 여부, 1단계 게임 클리어 여부와 동일합니다.',
    example: true,
  })
  isAttended: boolean;

  static fromPrimitives(primitives: AttendancePrimitives): AttendanceResponseDto {
    const dto = new AttendanceResponseDto();
    dto.attendandAt = primitives.attendandAt;
    dto.isAttended = primitives.isAttended;
    return dto;
  }
}
