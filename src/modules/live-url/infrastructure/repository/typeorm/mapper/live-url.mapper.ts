import { DateUtil } from '~/libs/utils/date.util';
import { LiveUrl } from '~/modules/live-url/domain/model/live-url';
import { LiveUrlEntity } from '~/modules/live-url/infrastructure/repository/typeorm/entity/live-url.entity';

export class LiveUrlMapper {
  static toEntity(liveUrl: LiveUrl): LiveUrlEntity {
    const primitives = liveUrl.toPrimitives();
    const entity = new LiveUrlEntity();
    entity.id = primitives.id;
    entity.sport = primitives.sport;
    entity.broadcastName = primitives.broadcastName;
    entity.url = primitives.url;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: LiveUrlEntity): LiveUrl {
    return LiveUrl.reconstruct({
      id: entity.id,
      sport: entity.sport,
      broadcastName: entity.broadcastName,
      url: entity.url,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
