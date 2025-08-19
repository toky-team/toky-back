import { Sport } from '~/libs/enums/sport';
import { LiveUrlPrimitives } from '~/modules/live-url/domain/model/live-url';

export abstract class LiveUrlFacade {
  abstract createLiveUrl(sport: Sport, broadcastName: string, url: string): Promise<LiveUrlPrimitives>;
  abstract updateLiveUrl(id: string, broadcastName?: string, url?: string): Promise<LiveUrlPrimitives>;
  abstract deleteLiveUrl(id: string): Promise<void>;
  abstract getLiveUrlById(id: string): Promise<LiveUrlPrimitives>;
  abstract getLiveUrlsBySport(sport: Sport): Promise<LiveUrlPrimitives[]>;
}
