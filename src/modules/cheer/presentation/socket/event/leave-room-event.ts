import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class LeaveRoomEvent implements SocketEvent {
  event = 'leave_room' as const;
  payload: LeaveRoomEventPayload = {
    sport: Sport.FOOTBALL,
  };
}

export interface LeaveRoomEventPayload {
  sport: Sport;
}
