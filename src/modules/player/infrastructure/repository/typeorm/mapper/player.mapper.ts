import { DateUtil } from '~/libs/utils/date.util';
import { Player } from '~/modules/player/domain/model/player';
import { PlayerEntity } from '~/modules/player/infrastructure/repository/typeorm/entity/player.entity';

export class PlayerMapper {
  static toEntity(player: Player): PlayerEntity {
    const primitives = player.toPrimitives();
    const entity = new PlayerEntity();
    entity.id = primitives.id;
    entity.name = primitives.name;
    entity.university = primitives.university;
    entity.sport = primitives.sport;
    entity.department = primitives.department;
    entity.birth = primitives.birth;
    entity.height = primitives.height;
    entity.weight = primitives.weight;
    entity.position = primitives.position;
    entity.backNumber = primitives.backNumber;
    entity.careers = primitives.careers;
    entity.imageUrl = primitives.imageUrl;
    entity.imageKey = primitives.imageKey;
    entity.likeCount = primitives.likeCount;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: PlayerEntity): Player {
    return Player.reconstruct({
      id: entity.id,
      name: entity.name,
      university: entity.university,
      sport: entity.sport,
      department: entity.department,
      birth: entity.birth,
      height: entity.height,
      weight: entity.weight,
      position: entity.position,
      backNumber: entity.backNumber,
      careers: entity.careers,
      imageUrl: entity.imageUrl,
      imageKey: entity.imageKey,
      likeCount: entity.likeCount,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
