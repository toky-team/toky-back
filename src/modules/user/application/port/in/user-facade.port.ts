import { User } from '~/modules/user/domain/model/user';

export abstract class UserFacade {
  abstract createUser(name: string, phoneNumber: string, university: string): Promise<User>;
}
