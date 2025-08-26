import { Injectable } from '@nestjs/common';

import { PlayerDailyLikeRepository } from '~/modules/player-daily-like/application/port/out/player-daily-like-repository.port';
import { PlayerDailyLike } from '~/modules/player-daily-like/domain/model/player-daily-like';

@Injectable()
export class PlayerDailyLikePersister {
  constructor(private readonly playerDailyLikeRepository: PlayerDailyLikeRepository) {}

  async save(playerDailyLike: PlayerDailyLike): Promise<void> {
    await this.playerDailyLikeRepository.save(playerDailyLike);
  }

  async saveAll(playerDailyLikes: PlayerDailyLike[]): Promise<void> {
    await this.playerDailyLikeRepository.saveAll(playerDailyLikes);
  }
}
