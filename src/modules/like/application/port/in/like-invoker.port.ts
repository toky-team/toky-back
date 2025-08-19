import { Sport } from '~/libs/enums/sport';
import { LikePrimitives } from '~/modules/like/domain/model/like';

export abstract class likeInvoker {
  abstract resetLike(sport: Sport): Promise<LikePrimitives>;
}
