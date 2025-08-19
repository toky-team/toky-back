import { Injectable } from '@nestjs/common';

import { PlayerLikeRepository } from '~/modules/player-like/application/port/out/player-like-repository.port';
import { PlayerLike } from '~/modules/player-like/domain/model/player-like';

@Injectable()
export class PlayerLikeReader {
  constructor(private readonly playerLikeRepository: PlayerLikeRepository) {}

  async findByUserId(userId: string): Promise<PlayerLike[]> {
    return this.playerLikeRepository.findByUserId(userId);
  }

  async findByUserIdAndPlayerId(userId: string, playerId: string): Promise<PlayerLike | null> {
    return this.playerLikeRepository.findByUserIdAndPlayerId(userId, playerId);
  }
}
