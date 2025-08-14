import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BetAnswerFacadeImpl } from '~/modules/bet-answer/application/facade/bet-answer-facade';
import { BetAnswerFacade } from '~/modules/bet-answer/application/port/in/bet-answer-facade.port';
import { BetAnswerInvoker } from '~/modules/bet-answer/application/port/in/bet-answer-invoker.port';
import { BetAnswerRepository } from '~/modules/bet-answer/application/port/out/bet-answer-repository.port';
import { BetAnswerPersister } from '~/modules/bet-answer/application/service/bet-answer-persister';
import { BetAnswerReader } from '~/modules/bet-answer/application/service/bet-answer-reader';
import { BetAnswerEntity } from '~/modules/bet-answer/infrastructure/repository/typeorm/entity/bet-answer.entity';
import { TypeOrmBetAnswerRepository } from '~/modules/bet-answer/infrastructure/repository/typeorm/typeorm-bet-answer-repository';
import { BetAnswerController } from '~/modules/bet-answer/presentation/http/bet-answer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BetAnswerEntity])],
  controllers: [BetAnswerController],
  providers: [
    BetAnswerReader,
    BetAnswerPersister,
    {
      provide: BetAnswerRepository,
      useClass: TypeOrmBetAnswerRepository,
    },
    {
      provide: BetAnswerFacade,
      useClass: BetAnswerFacadeImpl,
    },
    {
      provide: BetAnswerInvoker,
      useExisting: BetAnswerFacade,
    },
  ],
  exports: [BetAnswerInvoker],
})
export class BetAnswerModule {}
