import { Sport } from '~/libs/enums/sport';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export abstract class cheerInvoker {
  abstract resetCheer(sport: Sport): Promise<CheerPrimitives>;
}
