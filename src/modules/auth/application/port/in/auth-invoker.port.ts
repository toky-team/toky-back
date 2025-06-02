import { AuthPrimitives } from '~/modules/auth/domain/model/auth';

export abstract class AuthInvoker {
  abstract getAuthById(authId: string): Promise<AuthPrimitives>;
}
