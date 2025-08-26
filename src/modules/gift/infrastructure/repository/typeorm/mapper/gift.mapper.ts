import { DateUtil } from '~/libs/utils/date.util';
import { Gift } from '~/modules/gift/domain/model/gift';
import { GiftEntity } from '~/modules/gift/infrastructure/repository/typeorm/entity/gift.entity';

export class GiftMapper {
  static toEntity(gift: Gift): GiftEntity {
    const primitives = gift.toPrimitives();
    const entity = new GiftEntity();
    entity.id = primitives.id;
    entity.name = primitives.name;
    entity.alias = primitives.alias;
    entity.requiredTicket = primitives.requiredTicket;
    entity.imageUrl = primitives.imageUrl;
    entity.imageKey = primitives.imageKey;
    entity.drawCount = primitives.drawCount;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: GiftEntity): Gift {
    return Gift.reconstruct({
      id: entity.id,
      name: entity.name,
      alias: entity.alias,
      requiredTicket: entity.requiredTicket,
      imageUrl: entity.imageUrl,
      imageKey: entity.imageKey,
      drawCount: entity.drawCount,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
