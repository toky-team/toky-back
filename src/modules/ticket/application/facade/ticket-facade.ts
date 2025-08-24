import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { TicketFacade } from '~/modules/ticket/application/port/in/ticket-facade.port';
import { TicketPersister } from '~/modules/ticket/application/service/ticket-persister';
import { TicketReader } from '~/modules/ticket/application/service/ticket-reader';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';
import { TicketHistoryInvoker } from '~/modules/ticket-history/application/port/in/ticket-history-invoker.port';

@Injectable()
export class TicketFacadeImpl extends TicketFacade {
  constructor(
    private readonly ticketReader: TicketReader,
    private readonly ticketPersister: TicketPersister,

    private readonly ticketHistoryInvoker: TicketHistoryInvoker,
    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async getTicketCountByUserId(userId: string): Promise<number> {
    const ticketCount = await this.getOrInitializeTicketCount(userId);
    return ticketCount.count;
  }

  @Transactional()
  async incrementTicketCount(userId: string, count: number, reason: string): Promise<void> {
    const ticketCount = await this.getOrInitializeTicketCount(userId);

    ticketCount.getTickets(count);
    await this.ticketPersister.save(ticketCount);

    await this.ticketHistoryInvoker.createTicketHistory(userId, reason, count, ticketCount.count);
  }

  @Transactional()
  async decrementTicketCount(userId: string, count: number, reason: string): Promise<void> {
    const ticketCount = await this.getOrInitializeTicketCount(userId);

    ticketCount.useTickets(count);
    await this.ticketPersister.save(ticketCount);

    await this.ticketHistoryInvoker.createTicketHistory(userId, reason, -1 * count, ticketCount.count);
  }

  @Transactional()
  private async getOrInitializeTicketCount(userId: string): Promise<TicketCount> {
    const existingTicketCount = await this.ticketReader.findByUserId(userId);
    if (existingTicketCount !== null) {
      return existingTicketCount;
    }

    const ticketCount = TicketCount.create(this.idGenerator.generateId(), 0, userId);
    await this.ticketPersister.save(ticketCount);
    return ticketCount;
  }
}
