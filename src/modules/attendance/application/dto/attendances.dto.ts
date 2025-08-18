import { AttendancePrimitives } from '~/modules/attendance/domain/model/attendance';

export class AttendancesDto {
  attendances: AttendancePrimitives[];
  ticketCountByAttendance: number;
}
