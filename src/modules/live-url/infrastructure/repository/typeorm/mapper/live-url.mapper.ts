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
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: LiveUrlEntity): LiveUrl {
    return LiveUrl.reconstruct({
      id: entity.id,
      sport: entity.sport,
      broadcastName: entity.broadcastName,
      url: entity.url,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
