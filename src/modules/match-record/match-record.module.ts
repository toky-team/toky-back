import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MatchRecordFacadeImpl } from '~/modules/match-record/application/facade/match-record-facade';
import { MatchRecordFacade } from '~/modules/match-record/application/port/in/match-record-facade.port';
import { MatchRecordInvoker } from '~/modules/match-record/application/port/in/match-record-invoker.port';
import { MatchRecordRepository } from '~/modules/match-record/application/port/out/match-record-repository.port';
import { MatchRecordPersister } from '~/modules/match-record/application/service/match-record.persister';
import { MatchRecordReader } from '~/modules/match-record/application/service/match-record.reader';
import { MatchRecordValidateService } from '~/modules/match-record/domain/service/match-record-validate.service';
import { MongoMatchRecordRepository } from '~/modules/match-record/infrastructure/repository/mongo/mongo-match-record-repository';
import {
  MatchRecordMongo,
  MatchRecordSchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/match-record.schema';
import { MatchRecordController } from '~/modules/match-record/presentation/http/match-record.controller';
import { PlayerModule } from '~/modules/player/player.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: MatchRecordMongo.name, schema: MatchRecordSchema }]), PlayerModule],
  controllers: [MatchRecordController],
  providers: [
    MatchRecordReader,
    MatchRecordPersister,
    MatchRecordValidateService,
    {
      provide: MatchRecordRepository,
      useClass: MongoMatchRecordRepository,
    },
    {
      provide: MatchRecordFacade,
      useClass: MatchRecordFacadeImpl,
    },
    {
      provide: MatchRecordInvoker,
      useExisting: MatchRecordFacade,
    },
  ],
  exports: [MatchRecordInvoker],
})
export class MatchRecordModule {}
