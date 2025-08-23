import { DateUtil } from '~/libs/utils/date.util';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';
import { BetQuestionEntity } from '~/modules/bet-question/infrastructure/repository/typeorm/entity/bet-question.entity';

export class BetQuestionMapper {
  static toEntity(domain: BetQuestion): BetQuestionEntity {
    const primitives = domain.toPrimitives();
    const entity = new BetQuestionEntity();
    entity.id = primitives.id;
    entity.sport = primitives.sport;
    entity.question = primitives.question;
    entity.positionFilter = primitives.positionFilter;

    // answer 객체를 개별 컬럼으로 분해
    if (primitives.answer) {
      entity.answerMatchResult = primitives.answer.predict.matchResult;
      entity.answerKuScore = primitives.answer.predict.score.kuScore;
      entity.answerYuScore = primitives.answer.predict.score.yuScore;
      entity.answerKuPlayerId = primitives.answer.kuPlayer.playerId;
      entity.answerYuPlayerId = primitives.answer.yuPlayer.playerId;
    } else {
      entity.answerMatchResult = null;
      entity.answerKuScore = null;
      entity.answerYuScore = null;
      entity.answerKuPlayerId = null;
      entity.answerYuPlayerId = null;
    }

    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: BetQuestionEntity): BetQuestion {
    // 개별 컬럼들을 answer 객체로 조합
    const answer = entity.answerMatchResult
      ? {
          predict: {
            matchResult: entity.answerMatchResult,
            score: {
              kuScore: entity.answerKuScore!,
              yuScore: entity.answerYuScore!,
            },
          },
          kuPlayer: {
            playerId: entity.answerKuPlayerId,
          },
          yuPlayer: {
            playerId: entity.answerYuPlayerId,
          },
        }
      : null;

    return BetQuestion.reconstruct({
      id: entity.id,
      sport: entity.sport,
      question: entity.question,
      positionFilter: entity.positionFilter,
      answer: answer,
      createdAt: DateUtil.formatDate(entity.createdAt),
      updatedAt: DateUtil.formatDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.formatDate(entity.deletedAt) : null,
    });
  }
}
