import { Repository } from '~/libs/core/application-core/repository.interface';
import { Attendance } from '~/modules/attendance/domain/model/attendance';

export abstract class AttendanceRepository extends Repository<Attendance> {
  abstract findByUserId(userId: string): Promise<Attendance[]>;
  abstract findTodayAttendanceByUserId(userId: string): Promise<Attendance | null>;
}
