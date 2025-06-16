import { DateUtil } from '~/libs/utils/date.util';
import { TicketHistory } from '~/modules/ticket-history/domain/model/ticket-history';
import { TicketHistoryEntity } from '~/modules/ticket-history/infrastructure/repository/typeorm/entity/ticket-history.entity';

export class TicketHistoryMapper {
  static toEntity(domain: TicketHistory): TicketHistoryEntity {
    const primitives = domain.toPrimitives();
    const entity = new TicketHistoryEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.changeAmount = primitives.changeAmount;
    entity.resultAmount = primitives.resultAmount;
    entity.reason = primitives.reason;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: TicketHistoryEntity): TicketHistory {
    return TicketHistory.reconstruct({
      id: entity.id,
      userId: entity.userId,
      reason: entity.reason,
      changeAmount: entity.changeAmount,
      resultAmount: entity.resultAmount,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
