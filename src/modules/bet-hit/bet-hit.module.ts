import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BetHitFacadeImpl } from '~/modules/bet-hit/application/facade/bet-hit-facade';
import { BetHitListener } from '~/modules/bet-hit/application/listener/bet-hit.listener';
import { BetHitFacade } from '~/modules/bet-hit/application/port/in/bet-hit-facade.port';
import { BetHitInvoker } from '~/modules/bet-hit/application/port/in/bet-hit-invoker.port';
import { BetHitRepository } from '~/modules/bet-hit/application/port/out/bet-hit-repository.port';
import { BetHitPersister } from '~/modules/bet-hit/application/service/bet-hit-persister';
import { BetHitReader } from '~/modules/bet-hit/application/service/bet-hit-reader';
import { BetHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/bet-hit.entity';
import { SportHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/sport-hit.entity';
import { TypeOrmBetHitRepository } from '~/modules/bet-hit/infrastructure/repository/typeorm/typeorm-bet-hit-repository';
import { BetHitController } from '~/modules/bet-hit/presentation/http/bet-hit.controller';
import { BetQuestionModule } from '~/modules/bet-question/bet-question.module';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BetHitEntity, SportHitEntity]), UserModule, BetQuestionModule],
  controllers: [BetHitController],
  providers: [
    BetHitListener,

    BetHitReader,
    BetHitPersister,
    {
      provide: BetHitRepository,
      useClass: TypeOrmBetHitRepository,
    },
    {
      provide: BetHitFacade,
      useClass: BetHitFacadeImpl,
    },
    {
      provide: BetHitInvoker,
      useExisting: BetHitFacade,
    },
  ],
  exports: [BetHitInvoker],
})
export class BetHitModule {}
