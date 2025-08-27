import { SportHit } from '~/modules/bet-hit/domain/model/sport-hit';
import { SportHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/sport-hit.entity';

export class SportHitMapper {
  public static toDomain(entity: SportHitEntity): SportHit {
    return SportHit.createWithHits(
      entity.sport,
      entity.matchResultHit,
      entity.scoreHit,
      entity.kuPlayerHit,
      entity.yuPlayerHit
    );
  }

  public static toEntity(domain: SportHit, betHitId: string): SportHitEntity {
    const primitives = domain.toPrimitives();
    const entity = new SportHitEntity();

    entity.betHitId = betHitId;
    entity.sport = primitives.sport;
    entity.matchResultHit = primitives.matchResultHit;
    entity.scoreHit = primitives.scoreHit;
    entity.kuPlayerHit = primitives.kuPlayerHit;
    entity.yuPlayerHit = primitives.yuPlayerHit;

    return entity;
  }

  public static updateEntity(entity: SportHitEntity, domain: SportHit): void {
    const primitives = domain.toPrimitives();

    entity.matchResultHit = primitives.matchResultHit;
    entity.scoreHit = primitives.scoreHit;
    entity.kuPlayerHit = primitives.kuPlayerHit;
    entity.yuPlayerHit = primitives.yuPlayerHit;
  }
}
