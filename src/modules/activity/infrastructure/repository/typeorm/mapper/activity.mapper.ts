import { DateUtil } from '~/libs/utils/date.util';
import { Activity } from '~/modules/activity/domain/model/activity';
import { ActivityEntity } from '~/modules/activity/infrastructure/repository/typeorm/entity/activity.entity';

export class ActivityMapper {
  static toEntity(activity: Activity): ActivityEntity {
    const primitives = activity.toPrimitives();
    const entity = new ActivityEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.score = primitives.score;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: ActivityEntity): Activity {
    return Activity.reconstruct({
      id: entity.id,
      userId: entity.userId,
      score: entity.score,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
