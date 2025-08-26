import { Injectable } from '@nestjs/common';

import { PlayerDailyLikeRepository } from '~/modules/player-daily-like/application/port/out/player-daily-like-repository.port';
import { PlayerDailyLike } from '~/modules/player-daily-like/domain/model/player-daily-like';

@Injectable()
export class PlayerDailyLikeReader {
  constructor(private readonly playerDailyLikeRepository: PlayerDailyLikeRepository) {}

  async findByUserId(userId: string): Promise<PlayerDailyLike[]> {
    return this.playerDailyLikeRepository.findByUserId(userId);
  }

  async findRecentOneByUserId(userId: string): Promise<PlayerDailyLike | null> {
    return this.playerDailyLikeRepository.findRecentOneByUserId(userId);
  }
}
