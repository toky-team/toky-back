import { ExceptionFormat } from '~/libs/interfaces/exception-format.interface';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class ErrorEvent implements SocketEvent {
  event = 'error' as const;
  payload: ErrorEventPayload = {
    message: {
      timestamp: '2025-06-09T12:34:56Z',
      status: 400,
      error: 'Bad Request',
      message: '메시지 내용이 비어있습니다.',
      context: 'WebSocket',
    } as ExceptionFormat,
  };
}

export interface ErrorEventPayload {
  message: ExceptionFormat;
}
