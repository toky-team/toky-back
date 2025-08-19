import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';
import { LikePrimitives } from '~/modules/like/domain/model/like';

export class LikeUpdateEvent implements SocketEvent {
  event = 'like_update' as const;
  payload: LikeUpdateEventPayload = {
    like: {
      sport: Sport.FOOTBALL,
      KULike: 10,
      YULike: 2,
      createdAt: '2025-06-09T12:34:56Z',
      updatedAt: '2025-06-09T12:34:56Z',
    },
  };
}

export interface LikeUpdateEventPayload {
  like: LikePrimitives;
}
