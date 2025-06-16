import { Injectable } from '@nestjs/common';

import { TicketHistoryRepository } from '~/modules/ticket-history/application/port/out/ticket-history-repository.port';
import { TicketHistory } from '~/modules/ticket-history/domain/model/ticket-history';

@Injectable()
export class TicketHistoryPersister {
  constructor(private readonly ticketHistoryRepository: TicketHistoryRepository) {}

  async save(ticketHistory: TicketHistory): Promise<void> {
    await this.ticketHistoryRepository.save(ticketHistory);
  }

  async saveAll(ticketHistories: TicketHistory[]): Promise<void> {
    await this.ticketHistoryRepository.saveAll(ticketHistories);
  }
}
