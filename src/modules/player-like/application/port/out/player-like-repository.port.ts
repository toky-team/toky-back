import { Repository } from '~/libs/core/application-core/repository.interface';
import { PlayerLike } from '~/modules/player-like/domain/model/player-like';

export abstract class PlayerLikeRepository extends Repository<PlayerLike> {
  abstract findByUserId(userId: string): Promise<PlayerLike[]>;
  abstract findByUserIdAndPlayerId(userId: string, playerId: string): Promise<PlayerLike | null>;
}
