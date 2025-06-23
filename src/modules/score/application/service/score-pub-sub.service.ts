import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { ScorePrimitives } from '~/modules/score/domain/model/score';
import { isScorePrimitive } from '~/modules/score/utils/score-primitive.guard';

@Injectable()
export class ScorePubSubService {
  private readonly SCORE_CHANNEL = 'score';
  private readonly logger = new Logger(ScorePubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishScore(message: ScorePrimitives): Promise<void> {
    await this.pubSubClient.publish(this.SCORE_CHANNEL, { ...message });
  }

  async subscribeToScore(callback: (message: ScorePrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.SCORE_CHANNEL, async (message: Record<string, unknown>) => {
      this.logger.log('Received message on score channel', message);
      if (isScorePrimitive(message)) {
        await callback(message);
      } else {
        this.logger.warn('Received invalid message format', message);
      }
    });
  }
}
