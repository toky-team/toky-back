import { Injectable } from '@nestjs/common';

import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

@Injectable()
export class ChatPubSubService {
  private readonly CHAT_CHANNEL = 'chat';

  constructor(private readonly pubSubClient: PubSubClient) {}

  async publishChatMessage(message: ChatMessagePrimitives): Promise<void> {
    await this.pubSubClient.publish(this.CHAT_CHANNEL, { ...message });
  }

  subscribeToChatMessages(callback: (message: unknown) => void): void {
    this.pubSubClient.subscribe(this.CHAT_CHANNEL, callback);
  }
}
