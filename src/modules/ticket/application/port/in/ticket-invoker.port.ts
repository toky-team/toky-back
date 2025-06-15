export abstract class TicketInvoker {
  abstract initializeTicketCount(userId: string): Promise<void>;
}
