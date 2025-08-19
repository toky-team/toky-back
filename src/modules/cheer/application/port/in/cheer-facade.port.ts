import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export abstract class CheerFacade {
  abstract getCheer(sport: Sport): Promise<CheerPrimitives>;
  abstract addCheer(sport: Sport, university: University, likes: number): Promise<CheerPrimitives>;
  abstract resetCheer(sport: Sport): Promise<CheerPrimitives>;
}
