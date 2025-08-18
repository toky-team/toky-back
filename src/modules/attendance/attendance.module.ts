import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceFacadeImpl } from '~/modules/attendance/application/facade/attendance-facade';
import { AttendanceFacade } from '~/modules/attendance/application/port/in/attendance-facade.port';
import { AttendanceInvoker } from '~/modules/attendance/application/port/in/attendance-invoker.port';
import { AttendanceRepository } from '~/modules/attendance/application/port/out/attendance-repository.port';
import { AttendancePersister } from '~/modules/attendance/application/service/attendance-persister';
import { AttendanceReader } from '~/modules/attendance/application/service/attendance-reader';
import { AttendanceEntity } from '~/modules/attendance/infrastructure/repository/typeorm/entity/attendance.entity';
import { TypeOrmAttendanceRepository } from '~/modules/attendance/infrastructure/repository/typeorm/typeorm-attendance-repository';
import { AttendanceController } from '~/modules/attendance/presentation/http/attendance.controller';
import { ShareModule } from '~/modules/share/share.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceEntity]), ShareModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceReader,
    AttendancePersister,
    {
      provide: AttendanceRepository,
      useClass: TypeOrmAttendanceRepository,
    },
    {
      provide: AttendanceFacade,
      useClass: AttendanceFacadeImpl,
    },
    {
      provide: AttendanceInvoker,
      useExisting: AttendanceFacade,
    },
  ],
  exports: [AttendanceInvoker],
})
export class AttendanceModule {}
