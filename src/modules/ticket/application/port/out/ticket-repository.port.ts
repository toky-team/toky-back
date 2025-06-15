import { Repository } from '~/libs/core/application-core/repository.interface';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';

export abstract class TicketRepository extends Repository<TicketCount> {
  abstract findByUserId(userId: string): Promise<TicketCount | null>;
}
