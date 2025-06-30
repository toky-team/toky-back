import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BetQuestionFacadeImpl } from '~/modules/bet-question/application/facade/bet-question-facade';
import { BetQuestionFacade } from '~/modules/bet-question/application/port/in/bet-question-facade.port';
import { BetQuestionInvoker } from '~/modules/bet-question/application/port/in/bet-question-invoker.port';
import { BetQuestionRepository } from '~/modules/bet-question/application/port/out/bet-question-repository.port';
import { BetQuestionPersister } from '~/modules/bet-question/application/service/bet-question.persister';
import { BetQuestionReader } from '~/modules/bet-question/application/service/bet-question.reader';
import { BetQuestionInitializeService } from '~/modules/bet-question/application/service/bet-question-initialize.service';
import { BetQuestionValidateService } from '~/modules/bet-question/domain/service/bet-question-validate.service';
import { BetQuestionEntity } from '~/modules/bet-question/infrastructure/repository/typeorm/entity/bet-question.entity';
import { TypeOrmBetQuestionRepository } from '~/modules/bet-question/infrastructure/repository/typeorm/typeorm-bet-question-repository';
import { BetQuestionController } from '~/modules/bet-question/presentation/http/bet-question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BetQuestionEntity])],
  controllers: [BetQuestionController],
  providers: [
    BetQuestionReader,
    BetQuestionPersister,
    BetQuestionInitializeService,
    {
      provide: BetQuestionRepository,
      useClass: TypeOrmBetQuestionRepository,
    },
    {
      provide: BetQuestionFacade,
      useClass: BetQuestionFacadeImpl,
    },
    {
      provide: BetQuestionInvoker,
      useExisting: BetQuestionFacade,
    },

    BetQuestionValidateService,
  ],
  exports: [BetQuestionInvoker],
})
export class BetQuestionModule {}
