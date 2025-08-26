import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';
import { DateUtil } from '~/libs/utils/date.util';

export interface LikeSocketPayload {
  sport: Sport;
  KULike: number;
  YULike: number;
  createdAt: string;
  updatedAt: string;
}

export class LikeUpdateEvent implements SocketEvent {
  event = 'like_update' as const;
  payload: LikeUpdateEventPayload = {
    like: {
      sport: Sport.FOOTBALL,
      KULike: 10,
      YULike: 2,
      createdAt: DateUtil.format(DateUtil.fromDate(new Date('2025-06-09T12:34:56Z'))),
      updatedAt: DateUtil.format(DateUtil.fromDate(new Date('2025-06-09T12:34:56Z'))),
    },
  };
}

export interface LikeUpdateEventPayload {
  like: LikeSocketPayload;
}
