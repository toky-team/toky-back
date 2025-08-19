import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { Cheer } from '~/modules/cheer/domain/model/cheer';

export abstract class CheerRepository extends Repository<Cheer> {
  abstract findBySport(sport: Sport): Promise<Cheer | null>;
}
