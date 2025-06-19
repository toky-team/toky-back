export abstract class TicketHistoryInvoker {
  abstract createTicketHistory(
    userId: string,
    reason: string,
    changeAmount: number,
    resultAmount: number
  ): Promise<void>;
}
