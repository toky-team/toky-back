import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';

export class PingEvent implements SocketEvent {
  event = 'ping' as const;
  payload: undefined = undefined;
}
