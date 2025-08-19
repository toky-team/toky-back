import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { LiveUrl } from '~/modules/live-url/domain/model/live-url';

export abstract class LiveUrlRepository extends Repository<LiveUrl> {
  abstract findBySport(sport: Sport): Promise<LiveUrl[]>;
}
