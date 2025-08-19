import { DateUtil } from '~/libs/utils/date.util';
import { Cheer } from '~/modules/cheer/domain/model/cheer';
import { CheerEntity } from '~/modules/cheer/infrastructure/repository/typeorm/entity/cheer.entity';

export class CheerMapper {
  static toEntity(cheer: Cheer): CheerEntity {
    const primitives = cheer.toPrimitives();
    const entity = new CheerEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.university = primitives.university;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: CheerEntity): Cheer {
    return Cheer.reconstruct({
      id: entity.id,
      userId: entity.userId,
      university: entity.university,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
