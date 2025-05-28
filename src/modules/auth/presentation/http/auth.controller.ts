import { Body, Controller, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms, { StringValue } from 'ms';

import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AllowNotRegistered } from '~/modules/auth/presentation/guard/allow-not-registered.decorator';
import { AuthenticatedRequest } from '~/modules/auth/presentation/guard/authenticated-request.interface';
import { JwtAuthGuard } from '~/modules/auth/presentation/guard/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '~/modules/auth/presentation/guard/jwt-refresh-auth.guard';
import { KopasLoginRequestDto } from '~/modules/auth/presentation/http/dto/kopas-login.request.dto';
import { RefreshTokenResponseDto } from '~/modules/auth/presentation/http/dto/refresh-token.response.dto';
import { RegisterRequestDto } from '~/modules/auth/presentation/http/dto/register.request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authFacade: AuthFacade,

    private readonly configService: ConfigService
  ) {}

  @Post('/kopas/login')
  async kopasLogin(
    @Res() res: Response,
    @Body() body: KopasLoginRequestDto,
    @Query('callback') callback?: string
  ): Promise<void> {
    const { id, password } = body;
    const { token, isRegistered } = await this.authFacade.kopasLogin(id, password);

    const accessTokenExpiresIn = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');
    const accessTokenMaxAge = ms(accessTokenExpiresIn as StringValue);
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const refreshTokenMaxAge = ms(refreshTokenExpiresIn as StringValue);

    res.cookie('access-token', token.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: accessTokenMaxAge,
    });
    res.cookie('refresh-token', token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: refreshTokenMaxAge,
    });

    const callbackUrl = callback || 'http://localhost:3000/auth/callback';
    const redirectUrl = `${callbackUrl}?isRegistered=${isRegistered}`;

    return res.redirect(redirectUrl);
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponseDto> {
    const { payload } = req;
    if (!payload) {
      throw new UnauthorizedException('No payload found in request');
    }

    const refreshToken = req.cookies?.['refresh-token'];
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { token, isRegistered } = await this.authFacade.refreshToken(payload.authId, refreshToken);

    const accessTokenExpiresIn = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');
    const accessTokenMaxAge = ms(accessTokenExpiresIn as StringValue);
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const refreshTokenMaxAge = ms(refreshTokenExpiresIn as StringValue);

    res.cookie('access-token', token.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: accessTokenMaxAge,
    });
    res.cookie('refresh-token', token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: refreshTokenMaxAge,
    });

    return {
      isRegistered,
    };
  }

  @Post('/register')
  @UseGuards(JwtAuthGuard)
  @AllowNotRegistered()
  async register(@Req() req: AuthenticatedRequest, @Body() body: RegisterRequestDto): Promise<void> {
    const { payload } = req;
    if (!payload) {
      throw new UnauthorizedException('No payload found in request');
    }

    const { authId } = payload;
    const { name, phoneNumber, university } = body;

    await this.authFacade.register(authId, name, phoneNumber, university);
  }
}
