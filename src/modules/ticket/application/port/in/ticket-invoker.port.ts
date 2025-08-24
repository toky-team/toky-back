export abstract class TicketInvoker {
  abstract decrementTicketCount(userId: string, count: number, reason: string): Promise<void>;
}
