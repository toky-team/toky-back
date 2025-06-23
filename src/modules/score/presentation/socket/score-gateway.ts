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
import { ScorePubSubService } from '~/modules/score/application/service/score-pub-sub.service';
import { ScorePrimitives } from '~/modules/score/domain/model/score';
import { JoinRoomEventPayload } from '~/modules/score/presentation/socket/event/join-room-event';
import { LeaveRoomEventPayload } from '~/modules/score/presentation/socket/event/leave-room-event';

@WebSocketGateway({
  namespace: 'score',
  cors: { origin: '*' },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(WSLoggingInterceptor)
export class ScoreGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly clientRooms = new Map<string, Set<Sport>>();

  private readonly logger = new Logger(ScoreGateway.name);

  constructor(private readonly scorePubSubService: ScorePubSubService) {}

  async onModuleInit(): Promise<void> {
    await this.scorePubSubService.subscribeToScore(this.broadcastScore.bind(this));
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

  private broadcastScore(score: ScorePrimitives): void {
    this.server.to(`sport:${score.sport}`).emit('score_update', { score });
  }
}
