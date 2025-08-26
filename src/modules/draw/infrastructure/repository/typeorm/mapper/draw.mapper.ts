import { DateUtil } from '~/libs/utils/date.util';
import { Draw } from '~/modules/draw/domain/model/draw';
import { DrawEntity } from '~/modules/draw/infrastructure/repository/typeorm/entity/draw.entity';

export class DrawMapper {
  static toEntity(draw: Draw): DrawEntity {
    const primitives = draw.toPrimitives();
    const entity = new DrawEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.giftId = primitives.giftId;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: DrawEntity): Draw {
    return Draw.reconstruct({
      id: entity.id,
      userId: entity.userId,
      giftId: entity.giftId,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
