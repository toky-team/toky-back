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

    // predict 객체 처리
    entity.resultPredicted = primitives.predict !== null;
    entity.matchResult = primitives.predict?.matchResult ?? null;
    entity.kuScore = primitives.predict?.score?.kuScore ?? null;
    entity.yuScore = primitives.predict?.score?.yuScore ?? null;

    // kuPlayer 객체 처리
    entity.kuPlayerPredicted = primitives.kuPlayer !== null;
    entity.kuPlayerId = primitives.kuPlayer?.playerId ?? null;

    // yuPlayer 객체 처리
    entity.yuPlayerPredicted = primitives.yuPlayer !== null;
    entity.yuPlayerId = primitives.yuPlayer?.playerId ?? null;

    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;

    return entity;
  }

  static toDomain(entity: BetAnswerEntity): BetAnswer {
    return BetAnswer.reconstruct({
      id: entity.id,
      userId: entity.userId,
      sport: entity.sport,
      predict: entity.resultPredicted
        ? {
            matchResult: entity.matchResult!,
            score:
              entity.kuScore !== null && entity.yuScore !== null
                ? { kuScore: entity.kuScore, yuScore: entity.yuScore }
                : null,
          }
        : null,
      kuPlayer: entity.kuPlayerPredicted
        ? {
            playerId: entity.kuPlayerId,
          }
        : null,
      yuPlayer: entity.yuPlayerPredicted
        ? {
            playerId: entity.yuPlayerId,
          }
        : null,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}
