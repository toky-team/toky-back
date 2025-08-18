import { Injectable } from '@nestjs/common';

import { AttendanceRepository } from '~/modules/attendance/application/port/out/attendance-repository.port';
import { Attendance } from '~/modules/attendance/domain/model/attendance';

@Injectable()
export class AttendancePersister {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async save(attendance: Attendance): Promise<void> {
    await this.attendanceRepository.save(attendance);
  }

  async saveMany(attendances: Attendance[]): Promise<void> {
    await this.attendanceRepository.saveAll(attendances);
  }
}
