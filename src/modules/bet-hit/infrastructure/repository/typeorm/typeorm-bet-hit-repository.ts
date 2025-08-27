import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { BetHitRepository } from '~/modules/bet-hit/application/port/out/bet-hit-repository.port';
import { BetHit } from '~/modules/bet-hit/domain/model/bet-hit';
import { BetHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/bet-hit.entity';
import { BetHitMapper } from '~/modules/bet-hit/infrastructure/repository/typeorm/mapper/bet-hit.mapper';
import { BetHitCursorData, BetHitCursorUtil } from '~/modules/bet-hit/utils/bet-hit-cursor.util';

@Injectable()
export class TypeOrmBetHitRepository extends BetHitRepository {
  constructor(
    @InjectRepository(BetHitEntity)
    private readonly ormRepo: Repository<BetHitEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: BetHit): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(betHit: BetHit): Promise<void> {
    const entity = BetHitMapper.toEntity(betHit);
    await this.ormRepo.save(entity);
    await this.emitEvent(betHit);
  }

  async saveAll(betHits: BetHit[]): Promise<void> {
    const entities = betHits.map((betHit) => BetHitMapper.toEntity(betHit));
    await this.ormRepo.save(entities);
    await Promise.all(betHits.map((betHit) => this.emitEvent(betHit)));
  }

  async findById(id: string): Promise<BetHit | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
      relations: {
        sportHits: true,
      },
    });
    return entity ? BetHitMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<BetHit[]> {
    const entities = await this.ormRepo.find({
      relations: {
        sportHits: true,
      },
    });
    return entities.map((entity) => BetHitMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<BetHit | null> {
    const entity = await this.ormRepo.findOne({
      where: { userId },
      relations: {
        sportHits: true,
      },
    });
    return entity ? BetHitMapper.toDomain(entity) : null;
  }

  async countByTotalHitCountGreaterThan(totalHitCount: number): Promise<number> {
    return this.ormRepo.count({ where: { totalHitCount: MoreThan(totalHitCount) } });
  }

  async findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<BetHit>> {
    const { limit, cursor, order = 'DESC' } = cursorParam;

    let cursorData: BetHitCursorData | null = null;
    if (cursor) {
      try {
        const parsed = BetHitCursorUtil.parseCursorData(cursor);
        cursorData = parsed;
      } catch (error) {
        throw new DomainException(
          'BET_HIT',
          `커서값이 유효하지 않습니다: ${error instanceof Error ? error.message : error}`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const queryBuilder = this.ormRepo
      .createQueryBuilder('bet_hit')
      .leftJoinAndSelect('bet_hit.sportHits', 'sport_hits')
      .orderBy('bet_hit.totalHitCount', order)
      .addOrderBy('bet_hit.id', order)
      .take(limit + 1);

    if (cursorData) {
      const { totalHitCount, id } = cursorData;

      if (order === 'DESC') {
        queryBuilder.where('(bet_hit.totalHitCount, bet_hit.id) < (:cursorTotalHitCount, :cursorId)', {
          cursorTotalHitCount: totalHitCount,
          cursorId: id,
        });
      } else {
        queryBuilder.where('(bet_hit.totalHitCount, bet_hit.id) > (:cursorTotalHitCount, :cursorId)', {
          cursorTotalHitCount: totalHitCount,
          cursorId: id,
        });
      }
    }

    const entities = await queryBuilder.getMany();
    const hasNextPage = entities.length > limit;

    if (hasNextPage) {
      entities.pop();
    }

    const betHits = entities.map((entity) => BetHitMapper.toDomain(entity));

    let nextCursor: string | null = null;
    if (hasNextPage && betHits.length > 0) {
      const lastItem = betHits[betHits.length - 1];
      nextCursor = BetHitCursorUtil.createCursor({
        totalHitCount: lastItem.totalHitCount,
        id: lastItem.id,
      });
    }

    return {
      items: betHits,
      hasNext: hasNextPage,
      nextCursor,
    };
  }
}
