import { Injectable } from '@nestjs/common';

import { PlayerLikeRepository } from '~/modules/player-like/application/port/out/player-like-repository.port';
import { PlayerLike } from '~/modules/player-like/domain/model/player-like';

@Injectable()
export class PlayerLikePersister {
  constructor(private readonly playerLikeRepository: PlayerLikeRepository) {}

  async save(playerLike: PlayerLike): Promise<void> {
    return this.playerLikeRepository.save(playerLike);
  }

  async saveAll(playerLikes: PlayerLike[]): Promise<void> {
    return this.playerLikeRepository.saveAll(playerLikes);
  }
}
