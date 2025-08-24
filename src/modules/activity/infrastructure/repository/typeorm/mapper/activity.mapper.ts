import { DateUtil } from '~/libs/utils/date.util';
import { Activity } from '~/modules/activity/domain/module/activity';
import { ActivityEntity } from '~/modules/activity/infrastructure/repository/typeorm/entity/activity.entity';

export class ActivityMapper {
  static toEntity(activity: Activity): ActivityEntity {
    const primitives = activity.toPrimitives();
    const entity = new ActivityEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.score = primitives.score;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: ActivityEntity): Activity {
    return Activity.reconstruct({
      id: entity.id,
      userId: entity.userId,
      score: entity.score,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
