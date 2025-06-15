import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TicketFacadeImpl } from '~/modules/ticket/application/facade/ticket-facade';
import { TicketFacade } from '~/modules/ticket/application/port/in/ticket-facade.port';
import { TicketInvoker } from '~/modules/ticket/application/port/in/ticket-invoker.port';
import { TicketRepository } from '~/modules/ticket/application/port/out/ticket-repository.port';
import { TicketPersister } from '~/modules/ticket/application/service/ticket-persister';
import { TicketReader } from '~/modules/ticket/application/service/ticket-reader';
import { TicketCountEntity } from '~/modules/ticket/infrastructure/repository/entity/ticket-count.entity';
import { TypeOrmTicketRepository } from '~/modules/ticket/infrastructure/repository/typeorm-ticket-repository';
import { TicketController } from '~/modules/ticket/presentation/http/ticket.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TicketCountEntity])],
  controllers: [TicketController],
  providers: [
    TicketReader,
    TicketPersister,
    {
      provide: TicketRepository,
      useClass: TypeOrmTicketRepository,
    },
    {
      provide: TicketFacade,
      useClass: TicketFacadeImpl,
    },
    {
      provide: TicketInvoker,
      useExisting: TicketFacade,
    },
  ],
  exports: [TicketInvoker],
})
export class TicketModule {}
