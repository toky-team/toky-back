import { User } from '~/modules/user/domain/model/user';

export abstract class UserPersister {
  abstract save(user: User): Promise<void>;
  abstract saveAll(users: User[]): Promise<void>;
}
