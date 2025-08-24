import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { University } from '~/libs/enums/university';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ActivityRankDto } from '~/modules/activity/application/dto/activity-rank.dto';
import { ActivityFacade } from '~/modules/activity/application/port/in/activity-facade.port';
import { ActivityPersister } from '~/modules/activity/application/service/activity-persister';
import { ActivityReader } from '~/modules/activity/application/service/activity-reader';
import { Activity } from '~/modules/activity/domain/module/activity';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Injectable()
export class ActivityFacadeImpl extends ActivityFacade {
  constructor(
    private readonly activityReader: ActivityReader,
    private readonly activityPersister: ActivityPersister,

    private readonly userInvoker: UserInvoker,
    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async getRanksWithCursor(param: CursorPaginationParam): Promise<PaginatedResult<ActivityRankDto>> {
    const activities = await this.activityReader.findWithCursor(param);
    if (activities.items.length === 0) {
      return {
        items: [],
        hasNext: false,
        nextCursor: null,
      };
    }

    const distinctScores = [...new Set(activities.items.map((activity) => activity.score))];

    const counts = await Promise.all(distinctScores.map((score) => this.activityReader.countByScoreGreaterThan(score)));
    const scoreRankMap = new Map<number, number>();
    distinctScores.forEach((score, index) => {
      scoreRankMap.set(score, counts[index] + 1); // score 더 큰 사람 수 + 1
    });

    const userIds = activities.items.map((activity) => activity.userId);
    const users = await this.userInvoker.getUsersByIds(userIds);
    const userMap = new Map(users.map((user) => [user.id, user]));

    const items: ActivityRankDto[] = activities.items.map((activity) => {
      const user = userMap.get(activity.userId) ?? {
        id: activity.userId,
        name: '알 수 없음',
        university: University.KOREA_UNIVERSITY,
      };
      const rank = scoreRankMap.get(activity.score) ?? 0;
      return {
        userId: user.id,
        username: user.name,
        university: user.university,
        score: activity.score,
        rank: rank,
      };
    });
    return {
      items,
      hasNext: activities.hasNext,
      nextCursor: activities.nextCursor,
    };
  }

  async getRankByUserId(userId: string): Promise<ActivityRankDto> {
    const activity = await this.getOrCreateActivity(userId);

    const scoreGreaterCount = await this.activityReader.countByScoreGreaterThan(activity.score);
    const rank = scoreGreaterCount + 1;

    const user = await this.userInvoker.getUserById(userId);
    return {
      userId: user.id,
      username: user.name,
      university: user.university,
      score: activity.score,
      rank,
    };
  }

  @Transactional()
  async addScore(userId: string, score: number): Promise<void> {
    const activity = await this.getOrCreateActivity(userId);
    activity.addScore(score);
    await this.activityPersister.save(activity);
  }

  @Transactional()
  private async getOrCreateActivity(userId: string): Promise<Activity> {
    const activity = await this.activityReader.findByUserId(userId);
    if (activity !== null) {
      return activity;
    }

    const newActivity = Activity.create(this.idGenerator.generateId(), userId, 0);
    await this.activityPersister.save(newActivity);
    return newActivity;
  }
}
