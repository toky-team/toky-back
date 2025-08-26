export abstract class PlayerDailyLikeInvoker {
  abstract like(userId: string, count: number): Promise<void>;
}
