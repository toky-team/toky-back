import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '~/modules/auth/auth.module';
import { ChatFacadeImpl } from '~/modules/chat/application/facade/chat-facade';
import { ChatFacade } from '~/modules/chat/application/port/in/chat-facade.port';
import { ChatInvoker } from '~/modules/chat/application/port/in/chat-invoker.port';
import { ActiveUserStore } from '~/modules/chat/application/port/out/active-user-store.port';
import { ChatRepository } from '~/modules/chat/application/port/out/chat-repository.port';
import { ChatPersister } from '~/modules/chat/application/service/chat-persister';
import { ChatPubSubService } from '~/modules/chat/application/service/chat-pub-sub.service';
import { ChatReader } from '~/modules/chat/application/service/chat-reader';
import { ChatMessageEntity } from '~/modules/chat/infrastructure/repository/typeorm/entity/chat-message.entity';
import { TypeOrmChatRepository } from '~/modules/chat/infrastructure/repository/typeorm/typeorm-chat-repository';
import { RedisActiveUserStore } from '~/modules/chat/infrastructure/store/redis-active-user-store';
import { ChatController } from '~/modules/chat/presentation/http/chat.controller';
import { ChatGateway } from '~/modules/chat/presentation/socket/chat.gateway';
import { ChatWsDocsController } from '~/modules/chat/presentation/socket/ws-docs.controller';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessageEntity]), AuthModule, UserModule],
  controllers: [ChatController, ChatWsDocsController],
  providers: [
    ChatGateway,

    ChatReader,
    ChatPersister,
    ChatPubSubService,
    {
      provide: ChatRepository,
      useClass: TypeOrmChatRepository,
    },
    {
      provide: ActiveUserStore,
      useClass: RedisActiveUserStore,
    },
    {
      provide: ChatFacade,
      useClass: ChatFacadeImpl,
    },
    {
      provide: ChatInvoker,
      useExisting: ChatFacade,
    },
  ],
  exports: [ChatInvoker],
})
export class ChatModule {}
