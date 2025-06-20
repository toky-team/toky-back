import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class SendMessageEvent implements SocketEvent {
  event = 'send_message' as const;
  payload: SentMessageEventPayload = { message: '안녕하세요! 반갑습니다.', sport: Sport.FOOTBALL };
}

export interface SentMessageEventPayload {
  message: string;
  sport: Sport;
}
