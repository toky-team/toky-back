import { DrawPrimitives } from '~/modules/draw/domain/model/draw';

export abstract class DrawInvoker {
  abstract createDraw(giftId: string, userId: string, count: number): Promise<DrawPrimitives>;
  abstract countDraws(giftId: string, userId?: string): Promise<number>;
}
