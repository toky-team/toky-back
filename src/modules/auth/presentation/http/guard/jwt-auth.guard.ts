import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ALLOW_NOT_REGISTERED_KEY } from '~/libs/decorators/allow-not-registered.decorator';
import { INCLUDE_CREDENTIAL_PUBLIC_KEY, IS_PUBLIC_KEY } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { AuthInvoker } from '~/modules/auth/application/port/in/auth-invoker.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authInvoker: AuthInvoker,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler()) ?? false;
    if (isPublic) {
      return true;
    }

    const includeCredentialPublic =
      this.reflector.get<boolean>(INCLUDE_CREDENTIAL_PUBLIC_KEY, context.getHandler()) ?? false;
    const allowNotRegistered = this.reflector.get<boolean>(ALLOW_NOT_REGISTERED_KEY, context.getHandler()) ?? false;

    const target = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = target.cookies?.['access-token'];

    if (typeof token !== 'string' || !token) {
      if (includeCredentialPublic) {
        return true;
      }
      throw new UnauthorizedException('토큰이 제공되지 않았습니다');
    }

    try {
      const { payload, userId } = await this.authInvoker.validateJwtToken(token);
      target.payload = payload;

      if (!userId) {
        if (!allowNotRegistered) {
          throw new UnauthorizedException('사용자가 등록되지 않았습니다');
        }
      } else {
        target.user = { userId };
      }

      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      if (e instanceof DomainException) {
        throw new UnauthorizedException(e.message);
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
