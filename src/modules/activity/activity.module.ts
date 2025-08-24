import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityFacadeImpl } from '~/modules/activity/application/facade/activity-facade';
import { ActivityFacade } from '~/modules/activity/application/port/in/activity-facade.port';
import { ActivityInvoker } from '~/modules/activity/application/port/in/activity-invoker.port';
import { ActivityRepository } from '~/modules/activity/application/port/out/activity-repository.port';
import { ActivityPersister } from '~/modules/activity/application/service/activity-persister';
import { ActivityReader } from '~/modules/activity/application/service/activity-reader';
import { ActivityEntity } from '~/modules/activity/infrastructure/repository/typeorm/entity/activity.entity';
import { TypeOrmActivityRepository } from '~/modules/activity/infrastructure/repository/typeorm/typeorm-activity-repository';
import { ActivityController } from '~/modules/activity/presentation/http/activity.controller';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity]), UserModule],
  controllers: [ActivityController],
  providers: [
    ActivityReader,
    ActivityPersister,
    {
      provide: ActivityRepository,
      useClass: TypeOrmActivityRepository,
    },
    {
      provide: ActivityFacade,
      useClass: ActivityFacadeImpl,
    },
    {
      provide: ActivityInvoker,
      useExisting: ActivityFacade,
    },
  ],
  exports: [ActivityInvoker],
})
export class ActivityModule {}
