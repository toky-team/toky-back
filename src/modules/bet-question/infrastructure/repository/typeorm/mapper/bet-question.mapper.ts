import { DateUtil } from '~/libs/utils/date.util';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';
import { BetQuestionEntity } from '~/modules/bet-question/infrastructure/repository/typeorm/entity/bet-question.entity';

export class BetQuestionMapper {
  static toEntity(domain: BetQuestion): BetQuestionEntity {
    const primitives = domain.toPrimitives();
    const entity = new BetQuestionEntity();
    entity.id = primitives.id;
    entity.question = primitives.question;
    entity.options = primitives.options;
    entity.sport = primitives.sport;
    entity.order = primitives.order;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: BetQuestionEntity): BetQuestion {
    return BetQuestion.reconstruct({
      id: entity.id,
      question: entity.question,
      options: entity.options,
      sport: entity.sport,
      order: entity.order,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
