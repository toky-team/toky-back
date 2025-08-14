import { Injectable } from '@nestjs/common';

import { DateUtil } from '~/libs/utils/date.util';
import { BetAnswer } from '~/modules/bet-answer/domain/model/bet-answer';
import { BetAnswerEntity } from '~/modules/bet-answer/infrastructure/repository/typeorm/entity/bet-answer.entity';

@Injectable()
export class BetAnswerMapper {
  static toEntity(betAnswer: BetAnswer): BetAnswerEntity {
    const primitives = betAnswer.toPrimitives();
    const entity = new BetAnswerEntity();

    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.sport = primitives.sport;
    entity.matchResult = primitives.predict.matchResult;
    entity.scorePredicted = primitives.scorePredicted;
    entity.kuScore = primitives.predict.score?.kuScore ?? null;
    entity.yuScore = primitives.predict.score?.yuScore ?? null;
    entity.kuPlayerId = primitives.player.kuPlayerId;
    entity.yuPlayerId = primitives.player.yuPlayerId;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;

    return entity;
  }

  static toDomain(entity: BetAnswerEntity): BetAnswer {
    return BetAnswer.reconstruct({
      id: entity.id,
      userId: entity.userId,
      sport: entity.sport,
      predict: {
        matchResult: entity.matchResult,
        score:
          entity.kuScore !== null && entity.yuScore !== null
            ? { kuScore: entity.kuScore, yuScore: entity.yuScore }
            : null,
      },
      scorePredicted: entity.scorePredicted,
      player: {
        kuPlayerId: entity.kuPlayerId,
        yuPlayerId: entity.yuPlayerId,
      },
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
