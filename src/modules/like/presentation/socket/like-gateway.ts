import { Logger, OnModuleInit, UseFilters, UseInterceptors } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WsExceptionFilter } from '~/libs/common/filters/ws-exception.filter';
import { WSLoggingInterceptor } from '~/libs/common/interceptors/ws-logging.interceptor';
import { Sport } from '~/libs/enums/sport';
import { DateUtil } from '~/libs/utils/date.util';
import { LikeFacade } from '~/modules/like/application/port/in/like-facade.port';
import { LikePubSubService } from '~/modules/like/application/service/like-pub-sub.service';
import { LikePrimitives } from '~/modules/like/domain/model/like';
import { AddLikeEventPayload } from '~/modules/like/presentation/socket/event/add-like-event';
import { JoinRoomEventPayload } from '~/modules/like/presentation/socket/event/join-room-event';
import { LeaveRoomEventPayload } from '~/modules/like/presentation/socket/event/leave-room-event';
import { LikeSocketPayload } from '~/modules/like/presentation/socket/event/update-like.event';

@WebSocketGateway({
  namespace: 'like',
  cors: { origin: '*' },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(WSLoggingInterceptor)
export class LikeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly clientRooms = new Map<string, Set<Sport>>();

  private readonly logger = new Logger(LikeGateway.name);

  constructor(
    private readonly likeFacade: LikeFacade,
    private readonly likePubSubService: LikePubSubService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.likePubSubService.subscribeToLike(this.broadcastLike.bind(this));
  }

  handleConnection(client: Socket): void {
    const clientId = client.id;

    this.logger.log(`Client connected: ${clientId}`);
  }

  handleDisconnect(client: Socket): void {
    const clientId = client.id;
    const userRooms = this.clientRooms.get(clientId);

    if (userRooms) {
      this.clientRooms.delete(clientId);
      this.logger.log(`Client ${clientId} disconnected from all rooms`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, payload: JoinRoomEventPayload): void {
    const clientId = client.id;
    const { sport } = payload;

    if (!Object.values(Sport).includes(sport)) {
      this.logger.warn(`Invalid sport type: ${sport}`);
      return;
    }

    let userRooms = this.clientRooms.get(clientId);
    if (!userRooms) {
      userRooms = new Set<Sport>();
      this.clientRooms.set(clientId, userRooms);
    }

    if (userRooms.has(sport)) {
      this.logger.warn(`Client ${clientId} already joined room: ${sport}`);
      return;
    }

    client.join(`sport:${sport}`);
    userRooms.add(sport);

    this.logger.log(`Client ${clientId} joined room: ${sport}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, payload: LeaveRoomEventPayload): void {
    const clientId = client.id;
    const { sport } = payload;
    const userRooms = this.clientRooms.get(clientId);

    if (!userRooms || !userRooms.has(sport)) {
      this.logger.warn(`Client ${clientId} not in room: ${sport}`);
      return;
    }

    client.leave(`sport:${sport}`);
    userRooms.delete(sport);

    if (userRooms.size === 0) {
      this.clientRooms.delete(clientId);
    }

    this.logger.log(`Client ${clientId} left room: ${sport}`);
  }

  @SubscribeMessage('add_like')
  async handleLike(client: Socket, payload: AddLikeEventPayload): Promise<void> {
    const { sport, university, likes } = payload;
    const userRooms = this.clientRooms.get(client.id);

    if (!sport || !university || !likes || !userRooms || !userRooms.has(sport)) {
      return;
    }

    await this.likeFacade.addLike(sport, university, likes);
  }

  private broadcastLike(like: LikePrimitives): void {
    const likeSocketPayload: LikeSocketPayload = {
      ...like,
      createdAt: DateUtil.format(like.createdAt),
      updatedAt: DateUtil.format(like.updatedAt),
    };

    this.server.to(`sport:${like.sport}`).emit('like_update', { like: likeSocketPayload });
  }
}
