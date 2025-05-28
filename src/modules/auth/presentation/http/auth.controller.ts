import { Body, Controller, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: '고파스 로그인',
    description: 'KOPAS 계정으로 로그인합니다. 성공 시 쿠키에 access-token과 refresh-token을 설정합니다.',
  })
  @ApiQuery({
    name: 'callback',
    required: false,
    description:
      '로그인 후 리다이렉트할 URL 입니다. (default: http://localhost:3000/auth/callback) IsRegistered 쿼리 파라미터가 추가됩니다.',
  })
  @ApiBody({
    type: KopasLoginRequestDto,
    description: '고파스 로그인에 필요한 ID와 비밀번호를 포함합니다.',
  })
  @ApiResponse({
    status: 302,
    description: '로그인 성공 후 리다이렉트',
  })
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
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 액세스 토큰과 리프레시 토큰을 갱신합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: RefreshTokenResponseDto,
  })
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
  @ApiOperation({
    summary: '회원가입',
    description: '사용자 정보를 입력하여 회원가입을 진행합니다.',
  })
  @ApiBody({
    type: RegisterRequestDto,
    description: '회원가입에 필요한 사용자 정보를 포함합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
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
