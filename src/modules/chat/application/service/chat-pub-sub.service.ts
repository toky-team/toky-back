import { Injectable, Logger } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';
import { isChatMessagePrimitive } from '~/modules/chat/utils/chat-message-primitive.guard';

@Injectable()
export class ChatPubSubService {
  private readonly CHAT_CHANNEL = 'chat';
  private readonly logger = new Logger(ChatPubSubService.name);

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishChatMessage(message: ChatMessagePrimitives): Promise<void> {
    await this.pubSubClient.publish(this.CHAT_CHANNEL, { ...message });
  }

  async subscribeToChatMessages(callback: (message: ChatMessagePrimitives) => Promise<void> | void): Promise<void> {
    await this.pubSubClient.subscribe(this.CHAT_CHANNEL, async (message: Record<string, unknown>) => {
      if (isChatMessagePrimitive(message)) {
        await callback(message);
      } else {
        this.logger.warn('Received invalid message format', message);
      }
    });
  }
}
