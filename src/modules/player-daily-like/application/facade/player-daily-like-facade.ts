import { Injectable } from '@nestjs/common';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { PlayerDailyLikeFacade } from '~/modules/player-daily-like/application/port/in/player-daily-like-facade.port';
import { PlayerDailyLikePersister } from '~/modules/player-daily-like/application/service/player-daily-like-persister';
import { PlayerDailyLikeReader } from '~/modules/player-daily-like/application/service/player-daily-like-reader';
import { PlayerDailyLike } from '~/modules/player-daily-like/domain/model/player-daily-like';

@Injectable()
export class PlayerDailyLikeFacadeImpl extends PlayerDailyLikeFacade {
  constructor(
    private readonly playerDailyLikeReader: PlayerDailyLikeReader,
    private readonly playerDailyLikePersister: PlayerDailyLikePersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async like(userId: string, count: number): Promise<void> {
    const recentLike = await this.playerDailyLikeReader.findRecentOneByUserId(userId);
    if (recentLike && recentLike.isToday()) {
      recentLike.incrementLikeCount(count);
      await this.playerDailyLikePersister.save(recentLike);
      return;
    }

    const newLike = PlayerDailyLike.create(this.idGenerator.generateId(), userId);
    newLike.incrementLikeCount(count);
    await this.playerDailyLikePersister.save(newLike);
  }
}
