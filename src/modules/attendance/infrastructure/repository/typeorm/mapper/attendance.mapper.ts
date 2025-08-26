import { Injectable } from '@nestjs/common';

import { DateUtil } from '~/libs/utils/date.util';
import { Attendance } from '~/modules/attendance/domain/model/attendance';
import { AttendanceEntity } from '~/modules/attendance/infrastructure/repository/typeorm/entity/attendance.entity';

@Injectable()
export class AttendanceMapper {
  static toEntity(attendance: Attendance): AttendanceEntity {
    const primitives = attendance.toPrimitives();
    const entity = new AttendanceEntity();

    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.attendandAt = DateUtil.toDate(primitives.attendandAt);
    entity.gameStatus = primitives.gameStatus;
    entity.firstStageResult = primitives.firstStageResult;
    entity.secondStageResult = primitives.secondStageResult;
    entity.isAttended = primitives.isAttended;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;

    return entity;
  }

  static toDomain(entity: AttendanceEntity): Attendance {
    return Attendance.reconstruct({
      id: entity.id,
      userId: entity.userId,
      attendandAt: DateUtil.fromDate(entity.attendandAt),
      gameStatus: entity.gameStatus,
      firstStageResult: entity.firstStageResult,
      secondStageResult: entity.secondStageResult,
      isAttended: entity.isAttended,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
