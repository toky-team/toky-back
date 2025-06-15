import { DateUtil } from '~/libs/utils/date.util';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';
import { TicketCountEntity } from '~/modules/ticket/infrastructure/repository/entity/ticket-count.entity';

export class TicketMapper {
  static toEntity(domain: TicketCount): TicketCountEntity {
    const primitives = domain.toPrimitives();
    const entity = new TicketCountEntity();
    entity.id = primitives.id;
    entity.count = primitives.count;
    entity.userId = primitives.userId;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: TicketCountEntity): TicketCount {
    return TicketCount.reconstruct({
      id: entity.id,
      count: entity.count,
      userId: entity.userId,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
