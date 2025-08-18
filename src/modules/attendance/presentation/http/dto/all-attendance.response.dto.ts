import { ApiProperty } from '@nestjs/swagger';

import { AttendancesDto } from '~/modules/attendance/application/dto/attendances.dto';
import { AttendanceResponseDto } from '~/modules/attendance/presentation/http/dto/attendance.response.dto';

export class AllAttendanceResponseDto {
  @ApiProperty({
    description: '출석 목록',
    type: [AttendanceResponseDto],
  })
  attendances: AttendanceResponseDto[];

  @ApiProperty({
    description: '출석으로 얻은 티켓 수',
    type: Number,
  })
  ticketCountByAttendance: number;

  public static fromResult(result: AttendancesDto): AllAttendanceResponseDto {
    const dto = new AllAttendanceResponseDto();
    dto.attendances = result.attendances.map((attendance) => AttendanceResponseDto.fromPrimitives(attendance));
    dto.ticketCountByAttendance = result.ticketCountByAttendance;
    return dto;
  }
}
