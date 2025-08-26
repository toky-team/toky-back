import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { DateUtil } from '~/libs/utils/date.util';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';
import { isChatMessagePrimitive } from '~/modules/chat/utils/chat-message-primitive.guard';

@Injectable()
export class ChatPubSubService {
  private readonly CHAT_CHANNEL = 'chat';
  private readonly logger = new Logger(ChatPubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishChatMessage(message: ChatMessagePrimitives): Promise<void> {
    // PubSub 전송을 위해 Dayjs를 문자열로 변환
    const serializedMessage = {
      ...message,
      createdAt: DateUtil.format(message.createdAt),
      updatedAt: DateUtil.format(message.updatedAt),
      deletedAt: message.deletedAt ? DateUtil.format(message.deletedAt) : null,
    };
    await this.pubSubClient.publish(this.CHAT_CHANNEL, serializedMessage);
  }

  async subscribeToChatMessages(callback: (message: ChatMessagePrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.CHAT_CHANNEL, async (message: Record<string, unknown>) => {
      if (isChatMessagePrimitive(message)) {
        // 수신된 문자열 날짜를 Dayjs로 변환
        const deserializedMessage: ChatMessagePrimitives = {
          ...message,
          createdAt:
            typeof message.createdAt === 'string' ? DateUtil.fromDate(new Date(message.createdAt)) : message.createdAt,
          updatedAt:
            typeof message.updatedAt === 'string' ? DateUtil.fromDate(new Date(message.updatedAt)) : message.updatedAt,
          deletedAt:
            message.deletedAt && typeof message.deletedAt === 'string'
              ? DateUtil.fromDate(new Date(message.deletedAt))
              : message.deletedAt,
        } as ChatMessagePrimitives;
        await callback(deserializedMessage);
      } else {
        this.logger.warn('Received invalid message format', message);
      }
    });
  }
}
