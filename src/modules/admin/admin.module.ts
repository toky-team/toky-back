import { Module } from '@nestjs/common';

import { AdminFacadeImpl } from '~/modules/admin/application/facade/admin-facade';
import { AdminFacade } from '~/modules/admin/application/port/in/admin-facade.port';
import { AdminInvoker } from '~/modules/admin/application/port/in/admin-invoker.port';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { ScoreAdminController } from '~/modules/admin/presentation/http/score-admin.controller';
import { ScoreModule } from '~/modules/score/score.module';

@Module({
  imports: [ScoreModule],
  controllers: [ScoreAdminController],
  providers: [
    AdminGuard,
    {
      provide: AdminFacade,
      useClass: AdminFacadeImpl,
    },
    {
      provide: AdminInvoker,
      useExisting: AdminFacade,
    },
  ],
  exports: [],
})
export class AdminModule {}
