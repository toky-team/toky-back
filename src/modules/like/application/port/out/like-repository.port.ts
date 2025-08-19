import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { Like } from '~/modules/like/domain/model/like';

export abstract class LikeRepository extends Repository<Like> {
  abstract findBySport(sport: Sport): Promise<Like | null>;
}
