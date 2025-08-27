import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
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

  @Transactional()
  async sendMessage(userId: string, message: string, sport: Sport): Promise<void> {
    const user = await this.userInvoker.getUserById(userId);
    const chatMessage = ChatMessage.create(
      this.idGenerator.generateId(),
      sport,
      message,
      user.id,
      user.name,
      user.university
    );
    await this.chatPersister.save(chatMessage);

    await this.chatPubSubService.publishChatMessage(chatMessage.toPrimitives());
  }

  async getMessagesBySportWithCursor(
    sport: Sport,
    param: CursorPaginationParam
  ): Promise<PaginatedResult<ChatMessagePrimitives>> {
    const result = await this.chatReader.findBySportWithCursor(sport, param);
    return {
      ...result,
      items: result.items.map((item) => item.toPrimitives()),
    };
  }

  async setUserOnline(userId: string, sport: Sport): Promise<void> {
    await this.activeUserStore.setOnline(userId, sport);
  }

  async refreshUser(userId: string, sport: Sport): Promise<void> {
    await this.activeUserStore.refresh(userId, sport);
  }

  async removeUser(userId: string, sport: Sport): Promise<void> {
    await this.activeUserStore.remove(userId, sport);
  }

  async getActiveUserCount(sport: Sport): Promise<number> {
    return this.activeUserStore.count(sport);
  }

  @Transactional()
  async deleteMessage(messageId: string): Promise<void> {
    const message = await this.chatReader.findById(messageId);
    if (!message) {
      throw new DomainException('CHAT', '메시지를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    }
    message.delete();
    await this.chatPersister.save(message);

    await this.chatPubSubService.publishChatMessage(message.toPrimitives());
  }
}
