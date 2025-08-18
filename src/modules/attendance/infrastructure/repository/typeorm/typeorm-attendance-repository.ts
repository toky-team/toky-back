import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { AttendanceRepository } from '~/modules/attendance/application/port/out/attendance-repository.port';
import { Attendance } from '~/modules/attendance/domain/model/attendance';
import { AttendanceEntity } from '~/modules/attendance/infrastructure/repository/typeorm/entity/attendance.entity';
import { AttendanceMapper } from '~/modules/attendance/infrastructure/repository/typeorm/mapper/attendance.mapper';

@Injectable()
export class TypeOrmAttendanceRepository extends AttendanceRepository {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly ormRepo: Repository<AttendanceEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Attendance): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(attendance: Attendance): Promise<void> {
    const entity = AttendanceMapper.toEntity(attendance);
    await this.ormRepo.save(entity);
    await this.emitEvent(attendance);
  }

  async saveAll(attendances: Attendance[]): Promise<void> {
    const entities = attendances.map((attendance) => AttendanceMapper.toEntity(attendance));
    await this.ormRepo.save(entities);
    await Promise.all(attendances.map((attendance) => this.emitEvent(attendance)));
  }

  async findById(id: string): Promise<Attendance | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
    });
    return entity ? AttendanceMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Attendance[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => AttendanceMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<Attendance[]> {
    const entities = await this.ormRepo.find({
      where: { userId },
      order: { attendandAt: 'DESC' },
    });
    return entities.map((entity) => AttendanceMapper.toDomain(entity));
  }

  async findTodayAttendanceByUserId(userId: string): Promise<Attendance | null> {
    const todayStart = DateUtil.toUtcDate(DateUtil.now().startOf('date'));
    const todayEnd = DateUtil.toUtcDate(DateUtil.now().endOf('date'));

    const entity = await this.ormRepo.findOne({
      where: {
        userId,
        attendandAt: Between(todayStart, todayEnd),
      },
    });
    return entity ? AttendanceMapper.toDomain(entity) : null;
  }
}
