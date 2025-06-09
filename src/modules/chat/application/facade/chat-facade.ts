import { Injectable } from '@nestjs/common';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ChatFacade } from '~/modules/chat/application/port/in/chat-facade.port';
import { ActiveUserStore } from '~/modules/chat/application/port/out/active-user-store.port';
import { ChatPersister } from '~/modules/chat/application/service/chat-persister';
import { ChatPubSubService } from '~/modules/chat/application/service/chat-pub-sub.service';
import { ChatReader } from '~/modules/chat/application/service/chat-reader';
import { ChatMessage, ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Injectable()
export class ChatFacadeImpl extends ChatFacade {
  constructor(
    private readonly chatReader: ChatReader,
    private readonly chatPersister: ChatPersister,
    private readonly activeUserStore: ActiveUserStore,
    private readonly chatPubSubService: ChatPubSubService,

    private readonly userInvoker: UserInvoker,
    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async sendMessage(userId: string, message: string): Promise<void> {
    const user = await this.userInvoker.getUserById(userId);
    const chatMessage = ChatMessage.create(this.idGenerator.generateId(), message, user.id, user.name, user.university);
    await this.chatPersister.save(chatMessage);

    await this.chatPubSubService.publishChatMessage(chatMessage.toPrimitives());
  }

  async getMessagesByCursor(param: CursorPaginationParam): Promise<PaginatedResult<ChatMessagePrimitives>> {
    const result = await this.chatReader.findByCursor(param);
    return {
      ...result,
      items: result.items.map((item) => item.toPrimitives()),
    };
  }

  async setUserOnline(userId: string): Promise<void> {
    await this.activeUserStore.setOnline(userId);
  }

  async refreshUser(userId: string): Promise<void> {
    await this.activeUserStore.refresh(userId);
  }

  async removeUser(userId: string): Promise<void> {
    await this.activeUserStore.remove(userId);
  }

  async getActiveUserCount(): Promise<number> {
    return this.activeUserStore.count();
  }
}
