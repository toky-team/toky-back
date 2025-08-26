export abstract class PlayerDailyLikeFacade {
  abstract like(userId: string, count: number): Promise<void>;
}
