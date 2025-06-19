import { Repository } from '~/libs/core/application-core/repository.interface';
import { University } from '~/libs/enums/university';
import { User } from '~/modules/user/domain/model/user';

export abstract class UserRepository extends Repository<User> {
  abstract findMany(filter: UserFindFilter): Promise<User[]>;
}

export interface UserFindFilter {
  name?: string;
  phoneNumber?: string;
  university?: University;
}
