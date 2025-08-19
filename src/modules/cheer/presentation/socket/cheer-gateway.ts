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
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { CheerPubSubService } from '~/modules/cheer/application/service/cheer-pub-sub.service';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';
import { AddCheerEventPayload } from '~/modules/cheer/presentation/socket/event/add-cheer-event';
import { JoinRoomEventPayload } from '~/modules/cheer/presentation/socket/event/join-room-event';
import { LeaveRoomEventPayload } from '~/modules/cheer/presentation/socket/event/leave-room-event';

@WebSocketGateway({
  namespace: 'cheer',
  cors: { origin: '*' },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(WSLoggingInterceptor)
export class CheerGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly clientRooms = new Map<string, Set<Sport>>();

  private readonly logger = new Logger(CheerGateway.name);

  constructor(
    private readonly cheerFacade: CheerFacade,
    private readonly cheerPubSubService: CheerPubSubService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.cheerPubSubService.subscribeToCheer(this.broadcastCheer.bind(this));
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

  @SubscribeMessage('add_cheer')
  async handleCheer(client: Socket, payload: AddCheerEventPayload): Promise<void> {
    const { sport, university, likes } = payload;
    const userRooms = this.clientRooms.get(client.id);

    if (!sport || !university || !likes || !userRooms || !userRooms.has(sport)) {
      return;
    }

    await this.cheerFacade.addCheer(sport, university, likes);
  }

  private broadcastCheer(cheer: CheerPrimitives): void {
    this.server.to(`sport:${cheer.sport}`).emit('cheer_update', cheer);
  }
}
