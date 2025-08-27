import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { BetHit } from '~/modules/bet-hit/domain/model/bet-hit';
import { SportHit } from '~/modules/bet-hit/domain/model/sport-hit';
import { BetHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/bet-hit.entity';
import { SportHitMapper } from '~/modules/bet-hit/infrastructure/repository/typeorm/mapper/sport-hit.mapper';

export class BetHitMapper {
  public static toDomain(entity: BetHitEntity): BetHit {
    const sportHitsMap = new Map<Sport, SportHit>();

    // SportHitEntity들을 도메인 객체로 변환
    entity.sportHits.forEach((sportHitEntity) => {
      const sportHit = SportHitMapper.toDomain(sportHitEntity);
      sportHitsMap.set(sportHit.sport, sportHit);
    });

    // 모든 종목에 대해 SportHit이 존재하는지 확인하고 없으면 기본값 생성
    Object.values(Sport).forEach((sport) => {
      if (!sportHitsMap.has(sport)) {
        sportHitsMap.set(sport, SportHit.create(sport));
      }
    });

    const primitives = {
      id: entity.id,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
      userId: entity.userId,
      totalHitCount: entity.totalHitCount,
      sportHits: Array.from(sportHitsMap.values()).map((sportHit) => sportHit.toPrimitives()),
    };

    return BetHit.reconstruct(primitives);
  }

  public static toEntity(domain: BetHit): BetHitEntity {
    const primitives = domain.toPrimitives();
    const entity = new BetHitEntity();

    entity.id = primitives.id;
    entity.createdAt = primitives.createdAt.toDate();
    entity.updatedAt = primitives.updatedAt.toDate();
    entity.deletedAt = primitives.deletedAt ? primitives.deletedAt.toDate() : null;
    entity.userId = primitives.userId;
    entity.totalHitCount = primitives.totalHitCount;

    // SportHit 도메인 객체들을 엔티티로 변환
    entity.sportHits = primitives.sportHits.map((sportHitPrimitive) => {
      const sportHit = SportHit.reconstruct(sportHitPrimitive);
      return SportHitMapper.toEntity(sportHit, entity.id);
    });

    return entity;
  }
}
