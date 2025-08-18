import { Injectable } from '@nestjs/common';

import { AttendanceRepository } from '~/modules/attendance/application/port/out/attendance-repository.port';
import { Attendance } from '~/modules/attendance/domain/model/attendance';

@Injectable()
export class AttendanceReader {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async findByUserId(userId: string): Promise<Attendance[]> {
    return await this.attendanceRepository.findByUserId(userId);
  }

  async findTodayAttendanceByUserId(userId: string): Promise<Attendance | null> {
    return await this.attendanceRepository.findTodayAttendanceByUserId(userId);
  }
}
