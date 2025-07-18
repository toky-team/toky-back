import { Repository } from '~/libs/core/application-core/repository.interface';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { Player } from '~/modules/player/domain/model/player';

export abstract class PlayerRepository extends Repository<Player> {
  abstract findMany(filter: PlayerFindFilter): Promise<Player[]>;
  abstract findByNameAndUniversityAndSport(name: string, university: University, sport: Sport): Promise<Player | null>;
}

export interface PlayerFindFilter {
  university?: University;
  sport?: Sport;
  position?: string;
}
