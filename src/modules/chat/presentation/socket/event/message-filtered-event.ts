import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export interface FilteredMessageSocketPayload {
  id: string;
  sport: Sport;
}

export class MessageFilteredEvent implements SocketEvent {
  event = 'message_filtered' as const;
  payload: MessageFilteredEventPayload = {
    filteredMessage: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sport: Sport.FOOTBALL,
    },
  };
}

export interface MessageFilteredEventPayload {
  filteredMessage: FilteredMessageSocketPayload;
}
