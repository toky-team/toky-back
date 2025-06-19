import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
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

  @Transactional()
  async initializeTicketCount(userId: string): Promise<void> {
    const existingTicketCount = await this.ticketReader.findByUserId(userId);
    if (existingTicketCount !== null) {
      throw new DomainException('TICKET', `해당 사용자 ID의 티켓 카운트가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }

    const ticketCount = TicketCount.create(this.idGenerator.generateId(), 0, userId);
    await this.ticketPersister.save(ticketCount);
  }

  async getTicketCountByUserId(userId: string): Promise<number> {
    const ticketCount = await this.ticketReader.findByUserId(userId);
    if (ticketCount === null) {
      throw new DomainException('TICKET', `해당 사용자 ID의 티켓 카운트를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    return ticketCount.count;
  }

  @Transactional()
  async incrementTicketCount(userId: string, count: number, reason: string): Promise<void> {
    const ticketCount = await this.ticketReader.findByUserId(userId);
    if (ticketCount === null) {
      throw new DomainException('TICKET', `해당 사용자 ID의 티켓 카운트를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }

    ticketCount.getTickets(count);
    await this.ticketPersister.save(ticketCount);

    await this.ticketHistoryInvoker.createTicketHistory(userId, reason, count, ticketCount.count);
  }

  @Transactional()
  async decrementTicketCount(userId: string, count: number, reason: string): Promise<void> {
    const ticketCount = await this.ticketReader.findByUserId(userId);
    if (ticketCount === null) {
      throw new DomainException('TICKET', `해당 사용자 ID의 티켓 카운트를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }

    ticketCount.useTickets(count);
    await this.ticketPersister.save(ticketCount);

    await this.ticketHistoryInvoker.createTicketHistory(userId, reason, -1 * count, ticketCount.count);
  }
}
