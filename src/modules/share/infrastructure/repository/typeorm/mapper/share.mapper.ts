import { DateUtil } from '~/libs/utils/date.util';
import { Share } from '~/modules/share/domain/model/share';
import { ShareEntity } from '~/modules/share/infrastructure/repository/typeorm/entity/share.entity';

export class ShareMapper {
  static toEntity(share: Share): ShareEntity {
    const primitives = share.toPrimitives();
    const entity = new ShareEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.lastBetSharedAt = primitives.lastBetSharedAt ? DateUtil.toDate(primitives.lastBetSharedAt) : null;
    entity.lastGameSharedAt = primitives.lastGameSharedAt ? DateUtil.toDate(primitives.lastGameSharedAt) : null;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: ShareEntity): Share {
    return Share.reconstruct({
      id: entity.id,
      userId: entity.userId,
      lastBetSharedAt: entity.lastBetSharedAt ? DateUtil.fromDate(entity.lastBetSharedAt) : null,
      lastGameSharedAt: entity.lastGameSharedAt ? DateUtil.fromDate(entity.lastGameSharedAt) : null,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
