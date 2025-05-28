import { UserPrimitives } from '~/modules/user/domain/model/user';

export abstract class UserInvoker {
  abstract createUser(name: string, phoneNumber: string, university: string): Promise<UserPrimitives>;
}
