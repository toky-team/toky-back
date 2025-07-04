import { Module } from '@nestjs/common';

import { AdminFacadeImpl } from '~/modules/admin/application/facade/admin-facade';
import { AdminFacade } from '~/modules/admin/application/port/in/admin-facade.port';
import { AdminInvoker } from '~/modules/admin/application/port/in/admin-invoker.port';
import { BetQuestionAdminController } from '~/modules/admin/presentation/http/bet-question-admin.controller';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { ScoreAdminController } from '~/modules/admin/presentation/http/score-admin.controller';
import { UserAdminController } from '~/modules/admin/presentation/http/user-admin.controller';
import { BetQuestionModule } from '~/modules/bet-question/bet-question.module';
import { ScoreModule } from '~/modules/score/score.module';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [ScoreModule, UserModule, BetQuestionModule],
  controllers: [ScoreAdminController, UserAdminController, BetQuestionAdminController],
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
