import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { AttendancesDto } from '~/modules/attendance/application/dto/attendances.dto';
import { AttendanceFacade } from '~/modules/attendance/application/port/in/attendance-facade.port';
import { AttendancePersister } from '~/modules/attendance/application/service/attendance-persister';
import { AttendanceReader } from '~/modules/attendance/application/service/attendance-reader';
import { Attendance, AttendancePrimitives } from '~/modules/attendance/domain/model/attendance';
import { ShareInvoker } from '~/modules/share/application/port/in/share-invoker.port';

@Injectable()
export class AttendanceFacadeImpl extends AttendanceFacade {
  constructor(
    private readonly attendanceReader: AttendanceReader,
    private readonly attendancePersister: AttendancePersister,

    private readonly idGenerator: IdGenerator,
    private readonly shareInvoker: ShareInvoker
  ) {
    super();
  }

  async getTodayAttendanceByUserId(userId: string): Promise<AttendancePrimitives> {
    const attendance = await this.attendanceReader.findTodayAttendanceByUserId(userId);
    if (!attendance) {
      throw new DomainException('ATTENDANCE', '오늘 출석 정보가 없습니다', HttpStatus.NOT_FOUND);
    }
    return attendance.toPrimitives();
  }

  async getAttendancesByUserId(userId: string): Promise<AttendancesDto> {
    const attendances = await this.attendanceReader.findByUserId(userId);
    const ticketCount = attendances.reduce((count, attendance) => count + attendance.getTicketCountByAttendance(), 0);
    return {
      attendances: attendances.map((attendance) => attendance.toPrimitives()),
      ticketCountByAttendance: ticketCount,
    };
  }

  @Transactional()
  async startGame(userId: string): Promise<AttendancePrimitives> {
    let attendance = await this.attendanceReader.findTodayAttendanceByUserId(userId);
    if (!attendance) {
      attendance = Attendance.create(this.idGenerator.generateId(), userId);
    }
    attendance.startGame();
    await this.attendancePersister.save(attendance);

    return attendance.toPrimitives();
  }

  @Transactional()
  async completeStage(userId: string, stage: 1 | 2, win: boolean): Promise<AttendancePrimitives> {
    const attendance = await this.attendanceReader.findTodayAttendanceByUserId(userId);
    if (!attendance) {
      throw new DomainException('ATTENDANCE', '오늘 출석 정보가 없습니다', HttpStatus.NOT_FOUND);
    }

    if (stage === 1) {
      attendance.completeFirstGame(win);
    } else if (stage === 2) {
      attendance.completeSecondGame(win);
    }
    await this.attendancePersister.save(attendance);

    return attendance.toPrimitives();
  }

  @Transactional()
  async getAnotherChance(userId: string): Promise<AttendancePrimitives> {
    const attendance = await this.attendanceReader.findTodayAttendanceByUserId(userId);
    if (!attendance) {
      throw new DomainException('ATTENDANCE', '오늘 출석 정보가 없습니다', HttpStatus.NOT_FOUND);
    }

    attendance.getAnotherChance();
    await this.attendancePersister.save(attendance);

    await this.shareInvoker.gameShare(userId);

    return attendance.toPrimitives();
  }
}
