import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';

export abstract class AuthInvoker {
  abstract validateJwtToken(token: string): Promise<{ payload: JwtPayload; userId: string | null }>;
}
