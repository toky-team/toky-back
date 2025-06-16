import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TicketHistoryFacadeImpl } from '~/modules/ticket-history/application/facade/ticket-history-facade';
import { TicketHistoryFacade } from '~/modules/ticket-history/application/port/in/ticket-history-facade.port';
import { TicketHistoryInvoker } from '~/modules/ticket-history/application/port/in/ticket-history-invoker.port';
import { TicketHistoryRepository } from '~/modules/ticket-history/application/port/out/ticket-history-repository.port';
import { TicketHistoryPersister } from '~/modules/ticket-history/application/service/ticket-history.persister';
import { TicketHistoryReader } from '~/modules/ticket-history/application/service/ticket-history.reader';
import { TicketHistoryEntity } from '~/modules/ticket-history/infrastructure/repository/typeorm/entity/ticket-history.entity';
import { TypeOrmTicketHistoryRepository } from '~/modules/ticket-history/infrastructure/repository/typeorm/typeorm-ticket-history-repository';
import { TicketHistoryController } from '~/modules/ticket-history/presentation/http/ticket-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TicketHistoryEntity])],
  controllers: [TicketHistoryController],
  providers: [
    TicketHistoryReader,
    TicketHistoryPersister,
    {
      provide: TicketHistoryRepository,
      useClass: TypeOrmTicketHistoryRepository,
    },
    {
      provide: TicketHistoryFacade,
      useClass: TicketHistoryFacadeImpl,
    },
    {
      provide: TicketHistoryInvoker,
      useExisting: TicketHistoryFacade,
    },
  ],
  exports: [TicketHistoryInvoker],
})
export class TicketHistoryModule {}
