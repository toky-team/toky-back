import { Injectable } from '@nestjs/common';

import { ChatRepository } from '~/modules/chat/application/port/out/chat-repository.port';
import { ChatMessage } from '~/modules/chat/domain/model/chat-message';

@Injectable()
export class ChatPersister {
  constructor(private readonly chatRepository: ChatRepository) {}

  async save(chat: ChatMessage): Promise<void> {
    await this.chatRepository.save(chat);
  }

  async saveAll(chats: ChatMessage[]): Promise<void> {
    await this.chatRepository.saveAll(chats);
  }
}
