import { Injectable } from '@nestjs/common';

import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';
import { UserPrimitives } from '~/modules/user/domain/model/user';

@Injectable()
export class UserInvokerImpl extends UserInvoker {
  constructor(private readonly userFacade: UserFacade) {
    super();
  }

  async createUser(name: string, phoneNumber: string, university: string): Promise<UserPrimitives> {
    const user = await this.userFacade.createUser(name, phoneNumber, university);
    return user.toPrimitives();
  }
}
