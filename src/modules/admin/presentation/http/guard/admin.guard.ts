import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { AdminInvoker } from '~/modules/admin/application/port/in/admin-invoker.port';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminInvoker: AdminInvoker) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user.userId;
    const isAdmin = this.adminInvoker.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }
    return true;
  }
}
