import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class JoinRoomEvent implements SocketEvent {
  event = 'join_room' as const;
  payload: JoinRoomEventPayload = {
    sport: Sport.FOOTBALL,
  };
}

export interface JoinRoomEventPayload {
  sport: Sport;
}
