import { Injectable } from '@nestjs/common';

import { TicketRepository } from '~/modules/ticket/application/port/out/ticket-repository.port';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';

@Injectable()
export class TicketPersister {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async save(ticket: TicketCount): Promise<void> {
    await this.ticketRepository.save(ticket);
  }

  async saveAll(tickets: TicketCount[]): Promise<void> {
    await this.ticketRepository.saveAll(tickets);
  }
}
