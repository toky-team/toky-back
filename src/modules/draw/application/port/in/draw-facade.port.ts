import { DrawPrimitives } from '~/modules/draw/domain/model/draw';

export abstract class DrawFacade {
  abstract createDraw(giftId: string, userId: string, count: number): Promise<void>;
  abstract countDraws(giftId: string, userId?: string): Promise<number>;
  abstract getDraws(giftId: string): Promise<DrawPrimitives[]>;
}
