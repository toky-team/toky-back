export abstract class DrawFacade {
  abstract createDraw(giftId: string, userId: string, count: number): Promise<void>;
  abstract countDraws(giftId: string, userId?: string): Promise<number>;
}
