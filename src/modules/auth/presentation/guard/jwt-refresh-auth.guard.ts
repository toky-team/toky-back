import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { AuthenticatedRequest } from '~/modules/auth/presentation/interface/authenticated-request.interface';

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
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      request.payload = payload;

      return true;
    } catch (e) {
      throw new UnauthorizedException(e instanceof Error ? e.message : 'Invalid token');
    }
  }
}
