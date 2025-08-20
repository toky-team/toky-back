export abstract class TicketInvoker {
  abstract initializeTicketCount(userId: string): Promise<void>;
  abstract decrementTicketCount(userId: string, count: number, reason: string): Promise<void>;
}
