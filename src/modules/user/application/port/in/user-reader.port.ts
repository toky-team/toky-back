import { User } from '~/modules/user/domain/model/user';

export abstract class UserReader {
  abstract findById(id: string): Promise<User | null>;
  abstract existsByName(name: string): Promise<boolean>;
  abstract existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
}
