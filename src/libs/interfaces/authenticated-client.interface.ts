import { Socket } from 'socket.io';

import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';

export interface AuthenticatedClient extends Socket {
  user: {
    userId: string;
  };
  payload: JwtPayload;
}
