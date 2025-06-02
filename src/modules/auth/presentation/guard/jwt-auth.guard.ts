import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { AuthInvoker } from '~/modules/auth/application/port/in/auth-invoker.port';
import { ALLOW_NOT_REGISTERED_KEY } from '~/modules/auth/presentation/decorator/allow-not-registered.decorator';
import { IS_PUBLIC_KEY } from '~/modules/auth/presentation/decorator/public.decorator';
import { AuthenticatedRequest } from '~/modules/auth/presentation/interface/authenticated-request.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authInvoker: AuthInvoker,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler()) ?? false;
    if (isPublic) {
      return true;
    }

    const allowNotRegistered = this.reflector.get<boolean>(ALLOW_NOT_REGISTERED_KEY, context.getHandler()) ?? false;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.['access-token'];
    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      request.payload = payload;

      const auth = await this.authInvoker.getAuthById(payload.authId);
      const userId = auth.userId;

      if (!userId) {
        if (!allowNotRegistered) {
          throw new UnauthorizedException('사용자가 등록되지 않았습니다');
        }
      } else {
        request.user = { userId };
      }

      return true;
    } catch (e) {
      throw e instanceof UnauthorizedException ? e : new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
