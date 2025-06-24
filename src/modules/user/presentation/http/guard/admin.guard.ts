import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userInvoker: UserInvoker) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user.userId;
    const isAdmin = await this.userInvoker.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }
    return true;
  }
}
