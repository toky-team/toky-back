import { Injectable } from '@nestjs/common';

import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthInvoker } from '~/modules/auth/application/port/in/auth-invoker.port';

@Injectable()
export class AuthInvokerImpl extends AuthInvoker {
  constructor(private readonly authFacade: AuthFacade) {
    super();
  }
}
