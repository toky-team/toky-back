import { Logger, OnModuleInit, UseFilters, UseInterceptors } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WsExceptionFilter } from '~/libs/common/filters/ws-exception.filter';
import { WSLoggingInterceptor } from '~/libs/common/interceptors/ws-logging.interceptor';
import { AuthenticatedClient } from '~/libs/interfaces/authenticated-client.interface';
import { WsJwtAuthMiddleware } from '~/modules/auth/presentation/socket/middleware/ws-jwt-auth.middleware';
import { ChatFacade } from '~/modules/chat/application/port/in/chat-facade.port';
import { ChatPubSubService } from '~/modules/chat/application/service/chat-pub-sub.service';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';
import { isChatMessagePrimitive } from '~/modules/chat/utils/chat-message-primitive.guard';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(WSLoggingInterceptor)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('Chat');

  constructor(
    private readonly chatFacade: ChatFacade,
    private readonly chatPubSubService: ChatPubSubService,

    private readonly wsJwtAuthMiddleware: WsJwtAuthMiddleware
  ) {}

  async onModuleInit(): Promise<void> {
    await this.chatPubSubService.subscribeToChatMessages((message: Record<string, unknown>) => {
      if (isChatMessagePrimitive(message)) {
        this.broadcastMessage(message);
      } else {
        this.logger.warn('Received invalid message format', message);
      }
    });
  }

  afterInit(server: Server): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.use((socket: AuthenticatedClient, next) => this.wsJwtAuthMiddleware.authenticate(socket, next));
  }

  async handleConnection(client: AuthenticatedClient): Promise<void> {
    const userId = client.user.userId;

    this.logger.log(`User connected: ${userId}`);
    await this.chatFacade.setUserOnline(userId);
  }

  async handleDisconnect(client: AuthenticatedClient): Promise<void> {
    const userId = client.user.userId;
    await this.chatFacade.removeUser(userId);
  }

  @SubscribeMessage('ping')
  async handlePing(client: AuthenticatedClient): Promise<void> {
    const userId = client.user.userId;
    await this.chatFacade.refreshUser(userId);
  }

  @SubscribeMessage('send_message')
  async handleMessage(client: AuthenticatedClient, payload: { message: string }): Promise<void> {
    const userId = client.user.userId;
    const { message } = payload;
    if (!userId || !message) {
      return;
    }

    await this.chatFacade.sendMessage(userId, message);
  }

  private broadcastMessage(message: ChatMessagePrimitives): void {
    this.server.emit('receive_message', { message });
  }
}
