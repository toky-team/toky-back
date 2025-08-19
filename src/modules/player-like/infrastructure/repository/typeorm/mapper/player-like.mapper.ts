import { DateUtil } from '~/libs/utils/date.util';
import { PlayerLike } from '~/modules/player-like/domain/model/player-like';
import { PlayerLikeEntity } from '~/modules/player-like/infrastructure/repository/typeorm/entity/player-like.entity';

export class PlayerLikeMapper {
  static toEntity(playerLike: PlayerLike): PlayerLikeEntity {
    const primitives = playerLike.toPrimitives();
    const entity = new PlayerLikeEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.playerId = primitives.playerId;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: PlayerLikeEntity): PlayerLike {
    return PlayerLike.reconstruct({
      id: entity.id,
      userId: entity.userId,
      playerId: entity.playerId,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
