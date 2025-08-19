import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class AddCheerEvent implements SocketEvent {
  event = 'add_cheer' as const;
  payload: AddCheerEventPayload = { sport: Sport.FOOTBALL, university: University.KOREA_UNIVERSITY, likes: 1 };
}

export interface AddCheerEventPayload {
  sport: Sport;
  university: University;
  likes: number;
}
