import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthenticatedRequest } from '~/modules/auth/presentation/guard/authenticated-request.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authFacade: AuthFacade,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowNotRegistered = this.reflector.get<boolean>('allowNotRegistered', context.getHandler()) ?? false;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.['access-token'];
    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      request.payload = payload;

      const userId = await this.authFacade.findUserIdFromJwtPayload(payload);

      if (!userId) {
        if (!allowNotRegistered) {
          throw new UnauthorizedException('User not registered');
        }
      } else {
        request.user = { userId };
      }

      return true;
    } catch (e) {
      throw new UnauthorizedException(e instanceof Error ? e.message : 'Invalid token');
    }
  }
}
