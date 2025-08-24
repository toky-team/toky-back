import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ActivityRepository } from '~/modules/activity/application/port/out/activity-repository.port';
import { Activity } from '~/modules/activity/domain/module/activity';
import { ActivityEntity } from '~/modules/activity/infrastructure/repository/typeorm/entity/activity.entity';
import { ActivityMapper } from '~/modules/activity/infrastructure/repository/typeorm/mapper/activity.mapper';
import { ActivityCursorData, ActivityCursorUtil } from '~/modules/activity/utils/activity-cursor.util';

@Injectable()
export class TypeOrmActivityRepository extends ActivityRepository {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly ormRepo: Repository<ActivityEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Activity): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(activity: Activity): Promise<void> {
    const entity = ActivityMapper.toEntity(activity);
    await this.ormRepo.save(entity);
    await this.emitEvent(activity);
  }

  async saveAll(activities: Activity[]): Promise<void> {
    const entities = activities.map((activity) => ActivityMapper.toEntity(activity));
    await this.ormRepo.save(entities);
    await Promise.all(activities.map((activity) => this.emitEvent(activity)));
  }

  async findById(id: string): Promise<Activity | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? ActivityMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Activity[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => ActivityMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<Activity | null> {
    const entity = await this.ormRepo.findOne({ where: { userId } });
    return entity ? ActivityMapper.toDomain(entity) : null;
  }

  async countByScoreGreaterThan(score: number): Promise<number> {
    return this.ormRepo.count({ where: { score: MoreThan(score) } });
  }

  async findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<Activity>> {
    const { limit, cursor, order = 'DESC' } = cursorParam;

    let cursorData: ActivityCursorData | null = null;
    if (cursor) {
      try {
        const parsed = ActivityCursorUtil.parseCursorData(cursor);
        cursorData = parsed;
      } catch (error) {
        throw new DomainException(
          'ACTIVITY',
          `커서값이 유효하지 않습니다: ${error instanceof Error ? error.message : error}`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const queryBuilder = this.ormRepo
      .createQueryBuilder('activity')
      .orderBy('activity.score', order)
      .addOrderBy('activity.id', order)
      .take(limit + 1);

    if (cursorData) {
      const { score, id } = cursorData;

      if (order === 'DESC') {
        queryBuilder.where('(activity.score, activity.id) < (:cursorScore, :cursorId)', {
          cursorScore: score,
          cursorId: id,
        });
      } else {
        queryBuilder.where('(activity.score, activity.id) > (:cursorScore, :cursorId)', {
          cursorScore: score,
          cursorId: id,
        });
      }
    }

    const activities = await queryBuilder.getMany();

    const hasNext = activities.length > limit;
    const sliced = hasNext ? activities.slice(0, limit) : activities;
    let nextCursor: string | null = null;
    if (hasNext && sliced.length > 0) {
      const lastActivity = sliced[sliced.length - 1];
      const cursorData: ActivityCursorData = {
        score: lastActivity.score,
        id: lastActivity.id,
      };
      nextCursor = ActivityCursorUtil.createCursor(cursorData);
    }
    const items = sliced.map((e) => ActivityMapper.toDomain(e));

    return {
      items,
      nextCursor,
      hasNext,
    };
  }
}
