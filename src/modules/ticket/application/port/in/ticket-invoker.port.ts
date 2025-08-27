export abstract class TicketInvoker {
  abstract incrementTicketCount(userId: string, count: number, reason: string): Promise<void>;
  abstract decrementTicketCount(userId: string, count: number, reason: string): Promise<void>;
}
