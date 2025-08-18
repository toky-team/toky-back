import { AttendancesDto } from '~/modules/attendance/application/dto/attendances.dto';
import { AttendancePrimitives } from '~/modules/attendance/domain/model/attendance';

export abstract class AttendanceFacade {
  abstract getTodayAttendanceByUserId(userId: string): Promise<AttendancePrimitives>;
  abstract getAttendancesByUserId(userId: string): Promise<AttendancesDto>;
  abstract startGame(userId: string): Promise<AttendancePrimitives>;
  abstract completeStage(userId: string, stage: 1 | 2, win: boolean): Promise<AttendancePrimitives>;
  abstract getAnotherChance(userId: string): Promise<AttendancePrimitives>;
}
