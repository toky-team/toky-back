import { DateUtil } from '~/libs/utils/date.util';
import { PlayerDailyLike } from '~/modules/player-daily-like/domain/model/player-daily-like';
import { PlayerDailyLikeEntity } from '~/modules/player-daily-like/infrastructure/repository/typeorm/entity/player-daily-like.entity';

export class PlayerDailyLikeMapper {
  static toEntity(playerDailyLike: PlayerDailyLike): PlayerDailyLikeEntity {
    const primitives = playerDailyLike.toPrimitives();
    const entity = new PlayerDailyLikeEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.likeCount = primitives.likeCount;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: PlayerDailyLikeEntity): PlayerDailyLike {
    return PlayerDailyLike.reconstruct({
      id: entity.id,
      userId: entity.userId,
      likeCount: entity.likeCount,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
