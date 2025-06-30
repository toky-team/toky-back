import { Module } from '@nestjs/common';

import { ScoreFacadeImpl } from '~/modules/score/application/facade/score-facade';
import { ScoreFacade } from '~/modules/score/application/port/in/score-facade.port';
import { ScoreInvoker } from '~/modules/score/application/port/in/score-invoker.port';
import { ScoreRepository } from '~/modules/score/application/port/out/score-repository.port';
import { ScoreInitializeService } from '~/modules/score/application/service/score-initialize.service';
import { ScorePersister } from '~/modules/score/application/service/score-persister';
import { ScorePubSubService } from '~/modules/score/application/service/score-pub-sub.service';
import { ScoreReader } from '~/modules/score/application/service/score-reader';
import { RedisScoreRepository } from '~/modules/score/infrastructure/repository/redis/redis-score-repository';
import { ScoreController } from '~/modules/score/presentation/http/score.controller';
import { ScoreGateway } from '~/modules/score/presentation/socket/score-gateway';
import { ScoreWsDocsController } from '~/modules/score/presentation/socket/ws-docs.controller';

@Module({
  imports: [],
  controllers: [ScoreController, ScoreWsDocsController],
  providers: [
    ScoreGateway,

    ScoreReader,
    ScorePersister,
    ScorePubSubService,
    ScoreInitializeService,
    {
      provide: ScoreRepository,
      useClass: RedisScoreRepository,
    },
    {
      provide: ScoreFacade,
      useClass: ScoreFacadeImpl,
    },
    {
      provide: ScoreInvoker,
      useExisting: ScoreFacade,
    },
  ],
  exports: [ScoreInvoker],
})
export class ScoreModule {}
