import { Injectable } from '@nestjs/common';

import { ActivityRepository } from '~/modules/activity/application/port/out/activity-repository.port';
import { Activity } from '~/modules/activity/domain/model/activity';

@Injectable()
export class ActivityPersister {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async save(activity: Activity): Promise<void> {
    await this.activityRepository.save(activity);
  }

  async saveAll(activities: Activity[]): Promise<void> {
    await this.activityRepository.saveAll(activities);
  }
}
