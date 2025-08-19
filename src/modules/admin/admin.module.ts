import { Module } from '@nestjs/common';

import { AdminFacadeImpl } from '~/modules/admin/application/facade/admin-facade';
import { AdminFacade } from '~/modules/admin/application/port/in/admin-facade.port';
import { AdminInvoker } from '~/modules/admin/application/port/in/admin-invoker.port';
import { BetQuestionAdminController } from '~/modules/admin/presentation/http/bet-question-admin.controller';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { LikeAdminController } from '~/modules/admin/presentation/http/like-admin.controller';
import { MatchRecordAdminController } from '~/modules/admin/presentation/http/match-record-admin.controller';
import { PlayerAdminController } from '~/modules/admin/presentation/http/player-admin.controller';
import { ScoreAdminController } from '~/modules/admin/presentation/http/score-admin.controller';
import { UserAdminController } from '~/modules/admin/presentation/http/user-admin.controller';
import { BetQuestionModule } from '~/modules/bet-question/bet-question.module';
import { LikeModule } from '~/modules/like/like.module';
import { MatchRecordModule } from '~/modules/match-record/match-record.module';
import { PlayerModule } from '~/modules/player/player.module';
import { ScoreModule } from '~/modules/score/score.module';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [ScoreModule, UserModule, BetQuestionModule, PlayerModule, MatchRecordModule, LikeModule],
  controllers: [
    ScoreAdminController,
    UserAdminController,
    BetQuestionAdminController,
    PlayerAdminController,
    MatchRecordAdminController,
    LikeAdminController,
  ],
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
