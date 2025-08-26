import { Repository } from '~/libs/core/application-core/repository.interface';
import { PlayerDailyLike } from '~/modules/player-daily-like/domain/model/player-daily-like';

export abstract class PlayerDailyLikeRepository extends Repository<PlayerDailyLike> {
  abstract findByUserId(userId: string): Promise<PlayerDailyLike[]>;
  abstract findRecentOneByUserId(userId: string): Promise<PlayerDailyLike | null>;
}
