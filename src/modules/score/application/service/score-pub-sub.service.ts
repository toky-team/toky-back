import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { DateUtil } from '~/libs/utils/date.util';
import { ScorePrimitives } from '~/modules/score/domain/model/score';
import { isScorePrimitive } from '~/modules/score/utils/score-primitive.guard';

@Injectable()
export class ScorePubSubService {
  private readonly SCORE_CHANNEL = 'score';
  private readonly logger = new Logger(ScorePubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishScore(message: ScorePrimitives): Promise<void> {
    // PubSub 전송을 위해 Dayjs를 문자열로 변환
    const serializedMessage = {
      ...message,
      createdAt: DateUtil.format(message.createdAt),
      updatedAt: DateUtil.format(message.updatedAt),
    };
    await this.pubSubClient.publish(this.SCORE_CHANNEL, serializedMessage);
  }

  async subscribeToScore(callback: (message: ScorePrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.SCORE_CHANNEL, async (message: Record<string, unknown>) => {
      this.logger.log('Received message on score channel', message);
      if (isScorePrimitive(message)) {
        // 수신된 문자열 날짜를 Dayjs로 변환
        const deserializedMessage: ScorePrimitives = {
          ...message,
          createdAt:
            typeof message.createdAt === 'string' ? DateUtil.fromDate(new Date(message.createdAt)) : message.createdAt,
          updatedAt:
            typeof message.updatedAt === 'string' ? DateUtil.fromDate(new Date(message.updatedAt)) : message.updatedAt,
        } as ScorePrimitives;
        await callback(deserializedMessage);
      } else {
        this.logger.warn('Received invalid message format', message);
      }
    });
  }
}
