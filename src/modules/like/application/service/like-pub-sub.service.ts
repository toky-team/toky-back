import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { LikePrimitives } from '~/modules/like/domain/model/like';
import { isLikePrimitives } from '~/modules/like/utils/like-primitive.guard';

@Injectable()
export class LikePubSubService {
  private readonly LIKE_CHANNEL = 'like';
  private readonly logger = new Logger(LikePubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishLike(message: LikePrimitives): Promise<void> {
    await this.pubSubClient.publish(this.LIKE_CHANNEL, { ...message });
  }

  async subscribeToLike(callback: (message: LikePrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.LIKE_CHANNEL, async (message: Record<string, unknown>) => {
      this.logger.log(`Received message on like channel`, message);
      if (isLikePrimitives(message)) {
        await callback(message);
      } else {
        this.logger.warn(`Received invalid message format`, message);
      }
    });
  }
}
