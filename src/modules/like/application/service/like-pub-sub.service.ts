import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { DateUtil } from '~/libs/utils/date.util';
import { LikePrimitives } from '~/modules/like/domain/model/like';
import { isLikePrimitives } from '~/modules/like/utils/like-primitive.guard';

@Injectable()
export class LikePubSubService {
  private readonly LIKE_CHANNEL = 'like';
  private readonly logger = new Logger(LikePubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishLike(message: LikePrimitives): Promise<void> {
    // PubSub 전송을 위해 Dayjs를 문자열로 변환
    const serializedMessage = {
      ...message,
      createdAt: DateUtil.format(message.createdAt),
      updatedAt: DateUtil.format(message.updatedAt),
    };
    await this.pubSubClient.publish(this.LIKE_CHANNEL, serializedMessage);
  }

  async subscribeToLike(callback: (message: LikePrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.LIKE_CHANNEL, async (message: Record<string, unknown>) => {
      this.logger.log(`Received message on like channel`, message);
      if (isLikePrimitives(message)) {
        // 수신된 문자열 날짜를 Dayjs로 변환
        const deserializedMessage: LikePrimitives = {
          ...message,
          createdAt:
            typeof message.createdAt === 'string' ? DateUtil.fromDate(new Date(message.createdAt)) : message.createdAt,
          updatedAt:
            typeof message.updatedAt === 'string' ? DateUtil.fromDate(new Date(message.updatedAt)) : message.updatedAt,
        } as LikePrimitives;
        await callback(deserializedMessage);
      } else {
        this.logger.warn(`Received invalid message format`, message);
      }
    });
  }
}
