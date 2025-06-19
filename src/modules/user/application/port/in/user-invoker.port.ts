import { University } from '~/libs/enums/university';
import { UserPrimitives } from '~/modules/user/domain/model/user';

export abstract class UserInvoker {
  abstract createUser(name: string, phoneNumber: string, university: University): Promise<UserPrimitives>;
  abstract getUserById(id: string): Promise<UserPrimitives>;
}
