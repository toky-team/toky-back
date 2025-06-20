import { ExceptionFormat } from '~/libs/interfaces/exception-format.interface';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class ConnectErrorEvent implements SocketEvent {
  event = 'connect_error' as const;
  payload: ConnectErrorEventPayload = {
    message: JSON.stringify({
      timestamp: '2025-06-09T12:34:56Z',
      status: 401,
      error: 'Unauthorized',
      message: '토큰이 제공되지 않았습니다',
      context: 'WebSocket',
    } as ExceptionFormat),
  };
}

export interface ConnectErrorEventPayload {
  message: string;
}
