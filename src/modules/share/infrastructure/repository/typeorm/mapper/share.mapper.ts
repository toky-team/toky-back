import { DateUtil } from '~/libs/utils/date.util';
import { Share } from '~/modules/share/domain/model/share';
import { ShareEntity } from '~/modules/share/infrastructure/repository/typeorm/entity/share.entity';

export class ShareMapper {
  static toEntity(share: Share): ShareEntity {
    const primitives = share.toPrimitives();
    const entity = new ShareEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.lastBetSharedAt = primitives.lastBetSharedAt ? DateUtil.toUtcDate(primitives.lastBetSharedAt) : null;
    entity.lastGameSharedAt = primitives.lastGameSharedAt ? DateUtil.toUtcDate(primitives.lastGameSharedAt) : null;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: ShareEntity): Share {
    return Share.reconstruct({
      id: entity.id,
      userId: entity.userId,
      lastBetSharedAt: entity.lastBetSharedAt ? DateUtil.formatDate(entity.lastBetSharedAt) : null,
      lastGameSharedAt: entity.lastGameSharedAt ? DateUtil.formatDate(entity.lastGameSharedAt) : null,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
