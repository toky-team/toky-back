import { Request } from 'express';

import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
  payload: JwtPayload;
}
