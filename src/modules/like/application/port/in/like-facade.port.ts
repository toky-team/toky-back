import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { LikePrimitives } from '~/modules/like/domain/model/like';

export abstract class LikeFacade {
  abstract getLike(sport: Sport): Promise<LikePrimitives>;
  abstract addLike(sport: Sport, university: University, likes: number): Promise<LikePrimitives>;
  abstract resetLike(sport: Sport): Promise<LikePrimitives>;
}
