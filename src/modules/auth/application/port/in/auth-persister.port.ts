import { Auth } from '~/modules/auth/domain/model/auth';

export abstract class AuthPersister {
  abstract save(auth: Auth): Promise<void>;
  abstract saveAll(auths: Auth[]): Promise<void>;
}
