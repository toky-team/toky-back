import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.['refresh-token'];
    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      request.payload = payload;

      return true;
    } catch (e) {
      throw e instanceof UnauthorizedException ? e : new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
