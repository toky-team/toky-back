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
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: CheerEntity): Cheer {
    return Cheer.reconstruct({
      id: entity.id,
      userId: entity.userId,
      university: entity.university,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
