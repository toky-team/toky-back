import { Injectable } from '@nestjs/common';

import { TicketRepository } from '~/modules/ticket/application/port/out/ticket-repository.port';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';

@Injectable()
export class TicketReader {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async findById(id: string): Promise<TicketCount | null> {
    return this.ticketRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<TicketCount | null> {
    return this.ticketRepository.findByUserId(userId);
  }
}
