export abstract class TicketFacade {
  abstract getTicketCountByUserId(userId: string): Promise<number>;
  abstract incrementTicketCount(userId: string, count: number, reason: string): Promise<void>;
  abstract decrementTicketCount(userId: string, count: number, reason: string): Promise<void>;
}
