import { University } from '~/libs/enums/university';
import { UsersSummaryDto } from '~/modules/user/application/dto/users-summary.dto';
import { UserPrimitives } from '~/modules/user/domain/model/user';

export abstract class UserFacade {
  abstract createUser(name: string, phoneNumber: string, university: University): Promise<UserPrimitives>;
  abstract getUserById(id: string): Promise<UserPrimitives>;
  abstract getUsersSummary(): Promise<UsersSummaryDto>;
}
