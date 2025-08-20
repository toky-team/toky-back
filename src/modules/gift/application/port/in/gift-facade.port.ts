import { GiftWithDrawInfoDto } from '~/modules/gift/application/dto/gift-with-draw-info.dto';
import { GiftPrimitives } from '~/modules/gift/domain/model/gift';

export abstract class GiftFacade {
  abstract createGift(
    name: string,
    alias: string,
    requiredTicket: number,
    image: Express.Multer.File
  ): Promise<GiftPrimitives>;
  abstract updateGift(
    id: string,
    name?: string,
    alias?: string,
    requiredTicket?: number,
    image?: Express.Multer.File
  ): Promise<GiftPrimitives>;
  abstract deleteGift(id: string): Promise<void>;
  abstract getGifts(userId?: string): Promise<GiftWithDrawInfoDto[]>;
  abstract drawGift(userId: string, giftId: string, drawCount: number): Promise<void>;
}
