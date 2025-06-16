export abstract class TicketHistoryInvoker {
  abstract createTicketHistory(
    userId: string,
    changeAmount: number,
    resultAmount: number,
    reason: string
  ): Promise<void>;
}
