import { GiftPrimitives } from '~/modules/gift/domain/model/gift';

export class GiftWithDrawInfoDto {
  id: string;
  name: string;
  alias: string;
  requiredTicket: number;
  imageUrl: string;
  imageKey: string;
  drawCount: number;
  drawCountByUser?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  public static fromPrimitives(primitives: GiftPrimitives, drawCountByUser?: number): GiftWithDrawInfoDto {
    const dto = new GiftWithDrawInfoDto();
    dto.id = primitives.id;
    dto.name = primitives.name;
    dto.alias = primitives.alias;
    dto.requiredTicket = primitives.requiredTicket;
    dto.imageUrl = primitives.imageUrl;
    dto.imageKey = primitives.imageKey;
    dto.drawCount = primitives.drawCount;
    dto.drawCountByUser = drawCountByUser;
    dto.createdAt = primitives.createdAt;
    dto.updatedAt = primitives.updatedAt;
    dto.deletedAt = primitives.deletedAt;

    return dto;
  }
}
