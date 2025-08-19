import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';
import { isCheerPrimitives } from '~/modules/cheer/utils/cheer-primitive.guard';

@Injectable()
export class CheerPubSubService {
  private readonly CHEER_CHANNEL = 'cheer';
  private readonly logger = new Logger(CheerPubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishCheer(message: CheerPrimitives): Promise<void> {
    await this.pubSubClient.publish(this.CHEER_CHANNEL, { ...message });
  }

  async subscribeToCheer(callback: (message: CheerPrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.CHEER_CHANNEL, async (message: Record<string, unknown>) => {
      this.logger.log(`Received message on cheer channel`, message);
      if (isCheerPrimitives(message)) {
        await callback(message);
      } else {
        this.logger.warn(`Received invalid message format`, message);
      }
    });
  }
}
