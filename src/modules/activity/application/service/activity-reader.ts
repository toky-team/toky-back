import { Injectable } from '@nestjs/common';

import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ActivityRepository } from '~/modules/activity/application/port/out/activity-repository.port';
import { Activity } from '~/modules/activity/domain/model/activity';

@Injectable()
export class ActivityReader {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async findByUserId(userId: string): Promise<Activity | null> {
    return this.activityRepository.findByUserId(userId);
  }

  async countByScoreGreaterThan(score: number): Promise<number> {
    return this.activityRepository.countByScoreGreaterThan(score);
  }

  async findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<Activity>> {
    const defaultParam: CursorPaginationParam = {
      limit: cursorParam.limit ?? 20,
      order: cursorParam.order ?? 'DESC',
      cursor: cursorParam.cursor,
    };
    return this.activityRepository.findWithCursor(defaultParam);
  }
}
