import { DateUtil } from '~/libs/utils/date.util';
import { TicketCount } from '~/modules/ticket/domain/model/ticket-count';
import { TicketCountEntity } from '~/modules/ticket/infrastructure/repository/typeorm/entity/ticket-count.entity';

export class TicketMapper {
  static toEntity(domain: TicketCount): TicketCountEntity {
    const primitives = domain.toPrimitives();
    const entity = new TicketCountEntity();
    entity.id = primitives.id;
    entity.count = primitives.count;
    entity.userId = primitives.userId;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: TicketCountEntity): TicketCount {
    return TicketCount.reconstruct({
      id: entity.id,
      count: entity.count,
      userId: entity.userId,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
