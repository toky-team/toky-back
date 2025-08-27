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
import { Sport } from '~/libs/enums/sport';
import { AuthenticatedClient } from '~/libs/interfaces/authenticated-client.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { WsJwtAuthMiddleware } from '~/modules/auth/presentation/socket/middleware/ws-jwt-auth.middleware';
import { ChatFacade } from '~/modules/chat/application/port/in/chat-facade.port';
import { ChatPubSubService } from '~/modules/chat/application/service/chat-pub-sub.service';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';
import { JoinRoomEventPayload } from '~/modules/chat/presentation/socket/event/join-room-event';
import { LeaveRoomEventPayload } from '~/modules/chat/presentation/socket/event/leave-room-event';
import { FilteredMessageSocketPayload } from '~/modules/chat/presentation/socket/event/message-filtered-event';
import { ChatMessageSocketPayload } from '~/modules/chat/presentation/socket/event/receive-message-event';
import { SentMessageEventPayload } from '~/modules/chat/presentation/socket/event/sent-messave-event';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(WSLoggingInterceptor)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly clientRooms = new Map<string, Set<Sport>>();

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatFacade: ChatFacade,
    private readonly chatPubSubService: ChatPubSubService,

    private readonly wsJwtAuthMiddleware: WsJwtAuthMiddleware
  ) {}

  async onModuleInit(): Promise<void> {
    await this.chatPubSubService.subscribeToChatMessages(this.broadcastMessage.bind(this));
  }

  afterInit(server: Server): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.use((socket: AuthenticatedClient, next) => this.wsJwtAuthMiddleware.authenticate(socket, next));
  }

  handleConnection(client: AuthenticatedClient): void {
    const userId = client.user.userId;

    this.logger.log(`User connected: ${userId}`);
  }

  async handleDisconnect(client: AuthenticatedClient): Promise<void> {
    const userId = client.user.userId;
    const userRooms = this.clientRooms.get(client.id);

    if (userRooms) {
      for (const sport of userRooms) {
        await this.chatFacade.removeUser(userId, sport);
      }
      this.clientRooms.delete(client.id);
      this.logger.log(`User ${userId} disconnected from all rooms`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(client: AuthenticatedClient, payload: JoinRoomEventPayload): Promise<void> {
    const userId = client.user.userId;
    const { sport } = payload;

    if (!Object.values(Sport).includes(sport)) {
      return;
    }

    let userRooms = this.clientRooms.get(client.id);
    if (!userRooms) {
      userRooms = new Set<Sport>();
      this.clientRooms.set(client.id, userRooms);
    }

    if (userRooms.has(sport)) return;

    client.join(`sport:${sport}`);
    userRooms.add(sport);
    await this.chatFacade.setUserOnline(userId, sport);

    this.logger.log(`User ${userId} joined room: ${sport}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(client: AuthenticatedClient, payload: LeaveRoomEventPayload): Promise<void> {
    const userId = client.user.userId;
    const { sport } = payload;
    const userRooms = this.clientRooms.get(client.id);

    if (!userRooms || !userRooms.has(sport)) return;

    client.leave(`sport:${sport}`);
    userRooms.delete(sport);
    await this.chatFacade.removeUser(userId, sport);

    if (userRooms.size === 0) {
      this.clientRooms.delete(client.id);
    }

    this.logger.log(`User ${userId} left room: ${sport}`);
  }

  @SubscribeMessage('ping')
  async handlePing(client: AuthenticatedClient): Promise<void> {
    const userId = client.user.userId;
    const userRooms = this.clientRooms.get(client.id);

    if (userRooms) {
      for (const sport of userRooms) {
        await this.chatFacade.refreshUser(userId, sport);
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(client: AuthenticatedClient, payload: SentMessageEventPayload): Promise<void> {
    const userId = client.user.userId;
    const { message, sport } = payload;
    const userRooms = this.clientRooms.get(client.id);

    if (!userId || !message || !sport || !userRooms || !userRooms.has(sport)) {
      return;
    }

    await this.chatFacade.sendMessage(userId, message, sport);
  }

  private broadcastMessage(message: ChatMessagePrimitives): void {
    if (message.deletedAt === null) {
      // 클라이언트로 전송하기 전에 Dayjs를 YYYY-MM-DD HH:mm:ss 형식으로 변환
      const socketMessage: ChatMessageSocketPayload = {
        id: message.id,
        content: message.content,
        userId: message.userId,
        username: message.username,
        university: message.university,
        sport: message.sport,
        createdAt: DateUtil.format(message.createdAt),
        updatedAt: DateUtil.format(message.updatedAt),
        deletedAt: message.deletedAt ? DateUtil.format(message.deletedAt) : null,
      };
      this.server.to(`sport:${message.sport}`).emit('receive_message', { message: socketMessage });
    } else {
      const socketMessage: FilteredMessageSocketPayload = {
        id: message.id,
        sport: message.sport,
      };
      this.server.to(`sport:${message.sport}`).emit('message_filtered', { filteredMessage: socketMessage });
    }
  }
}
