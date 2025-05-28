import { Injectable } from '@nestjs/common';

import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Injectable()
export class UserInvokerImpl extends UserInvoker {
  constructor(private readonly userFacade: UserFacade) {
    super();
  }
}
