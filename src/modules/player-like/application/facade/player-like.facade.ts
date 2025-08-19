import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { PlayerLikeFacade } from '~/modules/player-like/application/port/in/player-like-facade.port';
import { PlayerLikePersister } from '~/modules/player-like/application/service/player-like-persister';
import { PlayerLikeReader } from '~/modules/player-like/application/service/player-like-reader';
import { PlayerLike } from '~/modules/player-like/domain/model/player-like';

@Injectable()
export class PlayerLikeFacadeImpl extends PlayerLikeFacade {
  constructor(
    private readonly playerLikeReader: PlayerLikeReader,
    private readonly playerLikePersister: PlayerLikePersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async likePlayer(userId: string, playerId: string): Promise<void> {
    const existingLike = await this.playerLikeReader.findByUserIdAndPlayerId(userId, playerId);
    if (existingLike) {
      return; // 이미 좋아요를 누른 경우, 아무 작업도 하지 않음
    }

    const playerLike = PlayerLike.create(this.idGenerator.generateId(), userId, playerId);
    await this.playerLikePersister.save(playerLike);
  }

  @Transactional()
  async unlikePlayer(userId: string, playerId: string): Promise<void> {
    const existingLike = await this.playerLikeReader.findByUserIdAndPlayerId(userId, playerId);
    if (!existingLike) {
      return; // 좋아요를 누르지 않은 경우, 아무 작업도 하지 않음
    }

    existingLike.delete();
    await this.playerLikePersister.save(existingLike);
  }

  async isLikedByUser(userId: string, playerId: string): Promise<boolean> {
    const playerLike = await this.playerLikeReader.findByUserIdAndPlayerId(userId, playerId);
    return !!playerLike;
  }
}
