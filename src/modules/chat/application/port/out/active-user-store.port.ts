import { Sport } from '~/libs/enums/sport';

export abstract class ActiveUserStore {
  abstract setOnline(userId: string, sport: Sport): Promise<void>;
  abstract refresh(userId: string, sport: Sport): Promise<void>;
  abstract remove(userId: string, sport: Sport): Promise<void>;
  abstract count(sport: Sport): Promise<number>;
}
