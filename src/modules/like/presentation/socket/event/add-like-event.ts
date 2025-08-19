import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class AddLikeEvent implements SocketEvent {
  event = 'add_like' as const;
  payload: AddLikeEventPayload = { sport: Sport.FOOTBALL, university: University.KOREA_UNIVERSITY, likes: 1 };
}

export interface AddLikeEventPayload {
  sport: Sport;
  university: University;
  likes: number;
}
