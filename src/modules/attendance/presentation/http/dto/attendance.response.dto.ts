import { ApiProperty } from '@nestjs/swagger';

import { DateUtil } from '~/libs/utils/date.util';
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

  @ApiProperty({
    description: '1단계 게임 클리어 여부(null 이면 아직 게임 완료 X)',
    example: true,
    type: Boolean,
    nullable: true,
  })
  firstStageResult: boolean | null;

  @ApiProperty({
    description: '2단계 게임 클리어 여부(null 이면 아직 게임 완료 X)',
    example: false,
    type: Boolean,
    nullable: true,
  })
  secondStageResult: boolean | null;

  static fromPrimitives(primitives: AttendancePrimitives): AttendanceResponseDto {
    const dto = new AttendanceResponseDto();
    dto.attendandAt = DateUtil.format(primitives.attendandAt);
    dto.isAttended = primitives.isAttended;
    dto.firstStageResult = primitives.firstStageResult;
    dto.secondStageResult = primitives.secondStageResult;
    return dto;
  }
}
