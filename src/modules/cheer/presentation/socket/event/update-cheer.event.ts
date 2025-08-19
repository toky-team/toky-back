import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export class CheerUpdateEvent implements SocketEvent {
  event = 'cheer_update' as const;
  payload: CheerUpdateEventPayload = {
    cheer: {
      sport: Sport.FOOTBALL,
      KULike: 10,
      YULike: 2,
      createdAt: '2025-06-09T12:34:56Z',
      updatedAt: '2025-06-09T12:34:56Z',
    },
  };
}

export interface CheerUpdateEventPayload {
  cheer: CheerPrimitives;
}
