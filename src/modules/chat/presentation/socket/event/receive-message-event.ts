import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';
import { DateUtil } from '~/libs/utils/date.util';

export interface ChatMessageSocketPayload {
  id: string;
  content: string;
  userId: string;
  username: string;
  university: University;
  sport: Sport;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class ReceiveMessageEvent implements SocketEvent {
  event = 'receive_message' as const;
  payload: ReceiveMessageEventPayload = {
    message: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      content: '안녕하세요! 반갑습니다.',
      userId: 'f4765f1d-a96d-4229-86eb-d5acdc55f645',
      username: '홍길동',
      university: University.KOREA_UNIVERSITY,
      sport: Sport.FOOTBALL,
      createdAt: DateUtil.format(DateUtil.fromDate(new Date('2025-06-09T12:34:56Z'))),
      updatedAt: DateUtil.format(DateUtil.fromDate(new Date('2025-06-09T12:34:56Z'))),
      deletedAt: null,
    },
  };
}

export interface ReceiveMessageEventPayload {
  message: ChatMessageSocketPayload;
}
