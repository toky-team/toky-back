import { Sport } from '~/libs/enums/sport';
import { LiveUrlPrimitives } from '~/modules/live-url/domain/model/live-url';

export abstract class LiveUrlInvoker {
  abstract createLiveUrl(sport: Sport, broadcastName: string, url: string): Promise<LiveUrlPrimitives>;
  abstract updateLiveUrl(id: string, broadcastName?: string, url?: string): Promise<LiveUrlPrimitives>;
  abstract deleteLiveUrl(id: string): Promise<void>;
}
