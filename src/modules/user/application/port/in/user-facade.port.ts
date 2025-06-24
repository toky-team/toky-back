import { University } from '~/libs/enums/university';
import { UserPrimitives } from '~/modules/user/domain/model/user';

export abstract class UserFacade {
  abstract createUser(name: string, phoneNumber: string, university: University): Promise<UserPrimitives>;
  abstract getUserById(id: string): Promise<UserPrimitives>;
  abstract isAdmin(id: string): Promise<boolean>;
}
