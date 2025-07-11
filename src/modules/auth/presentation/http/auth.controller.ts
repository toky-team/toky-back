import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';
import ms, { StringValue } from 'ms';

import { CryptoUtil } from '~/libs/common/cryptos/crypto.util';
import { AllowNotRegistered } from '~/libs/decorators/allow-not-registered.decorator';
import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { KopasLoginRequestDto } from '~/modules/auth/presentation/http/dto/kopas-login.request.dto';
import { RefreshTokenResponseDto } from '~/modules/auth/presentation/http/dto/refresh-token.response.dto';
import { RegisterRequestDto } from '~/modules/auth/presentation/http/dto/register.request.dto';
import { JwtRefreshAuthGuard } from '~/modules/auth/presentation/http/guard/jwt-refresh-auth.guard';
import {
  decodeKakaoState,
  encodeKakaoState,
  KakaoState,
} from '~/modules/auth/presentation/http/interface/kakao-state.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authFacade: AuthFacade,

    private readonly configService: ConfigService,
    private readonly cryptoUtil: CryptoUtil
  ) {}

  @Post('/login/kopas')
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
  @Public()
  async kopasLogin(
    @Res() res: Response,
    @Body() body: KopasLoginRequestDto,
    @Query('callback') callback?: string
  ): Promise<void> {
    const { id, password } = body;
    const { token, isRegistered } = await this.authFacade.kopasLogin(id, password);

    this.setAuthCookies(res, token);

    const callbackUrl = decodeURIComponent(callback || 'http://localhost:3000/auth/callback');
    const redirectUrl = this.createRedirectUrl(decodeURIComponent(callbackUrl), {
      isRegistered: isRegistered.toString(),
    });

    return res.redirect(redirectUrl);
  }

  @Get('/login/kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 계정으로 로그인합니다. 성공 시 쿠키에 access-token과 refresh-token을 설정합니다.',
  })
  @ApiQuery({
    name: 'callback',
    required: false,
    description:
      '로그인 후 리다이렉트할 URL 입니다. (default: http://localhost:3000/auth/callback), IsRegistered 쿼리 파라미터가 추가됩니다.',
  })
  @ApiResponse({
    status: 302,
    description: '로그인 성공 후 리다이렉트',
  })
  @Public()
  kakaoLogin(@Res() res: Response, @Query('callback') callback?: string): void {
    const kakaoClientId = this.configService.getOrThrow<string>('KAKAO_CLIENT_ID');
    const kakaoRedirectUri = this.configService.getOrThrow<string>('KAKAO_REDIRECT_URI');

    const callbackUrl = decodeURIComponent(callback || 'http://localhost:3000/auth/callback');
    const kakaoState: KakaoState = {
      mode: 'login',
      callbackUrl,
    };
    const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
    kakaoAuthUrl.searchParams.append('client_id', kakaoClientId);
    kakaoAuthUrl.searchParams.append('redirect_uri', kakaoRedirectUri);
    kakaoAuthUrl.searchParams.append('response_type', 'code');
    kakaoAuthUrl.searchParams.append('state', encodeKakaoState(kakaoState));

    return res.redirect(kakaoAuthUrl.toString());
  }

  @Post('/connect/kopas')
  @ApiOperation({
    summary: '고파스 계정 연결',
    description: '이미 등록된 계정에 고파스 계정을 연결합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '고파스 계정 연결 성공',
  })
  async connectKopas(@Req() req: AuthenticatedRequest, @Body() body: KopasLoginRequestDto): Promise<void> {
    const { user } = req;
    const { id, password } = body;

    await this.authFacade.connectKopas(user.userId, id, password);
  }

  @Get('/connect/kakao')
  @ApiOperation({
    summary: '카카오 계정 연결',
    description: '이미 등록된 계정에 카카오 계정을 연결합니다.',
  })
  @ApiQuery({
    name: 'callback',
    required: false,
    description: '연결 후 리다이렉트할 URL 입니다. (default: http://localhost:3000/auth/callback)',
  })
  @ApiResponse({
    status: 302,
    description: '로그인 성공 후 리다이렉트',
  })
  connectKakao(@Req() req: AuthenticatedRequest, @Res() res: Response, @Query('callback') callback?: string): void {
    const { user } = req;
    const kakaoClientId = this.configService.getOrThrow<string>('KAKAO_CLIENT_ID');
    const kakaoRedirectUri = this.configService.getOrThrow<string>('KAKAO_REDIRECT_URI');

    const callbackUrl = decodeURIComponent(callback || 'http://localhost:3000/auth/callback');
    // userId는 암호화된 상태로 전달합니다
    const encryptedUserId = this.cryptoUtil.encryptData(user.userId);
    const kakaoState: KakaoState = {
      mode: 'connect',
      callbackUrl,
      userId: encryptedUserId,
    };

    const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
    kakaoAuthUrl.searchParams.append('client_id', kakaoClientId);
    kakaoAuthUrl.searchParams.append('redirect_uri', kakaoRedirectUri);
    kakaoAuthUrl.searchParams.append('response_type', 'code');
    kakaoAuthUrl.searchParams.append('state', encodeKakaoState(kakaoState));

    return res.redirect(kakaoAuthUrl.toString());
  }

  @Get('/kakao/redirect')
  @ApiOperation({
    summary: '카카오 로그인 리다이렉트',
    description: '카카오 서버에서 리다이렉트되는 URL입니다. (클라이언트에서 사용하지 않습니다)',
  })
  @Public()
  async kakaoRedirect(@Query('code') code: string, @Query('state') state: string, @Res() res: Response): Promise<void> {
    const kakaoState = decodeKakaoState(state);
    const { mode, callbackUrl, userId } = kakaoState;

    if (mode === 'login') {
      const { token, isRegistered } = await this.authFacade.kakaoLogin(code);

      this.setAuthCookies(res, token);

      const redirectUrl = this.createRedirectUrl(decodeURIComponent(callbackUrl), {
        isRegistered: isRegistered.toString(),
      });

      return res.redirect(redirectUrl);
    } else if (mode === 'connect') {
      if (!userId) {
        throw new BadRequestException('유효하지 않은 카카오 상태 정보입니다');
      }

      // userId는 암호화된 상태로 전달되므로 복호화합니다
      const decryptedUserId = this.cryptoUtil.decryptData(userId);
      await this.authFacade.connectKakao(decryptedUserId, code);

      const redirectUrl = this.createRedirectUrl(decodeURIComponent(callbackUrl), {});

      return res.redirect(redirectUrl);
    } else {
      throw new BadRequestException('유효하지 않은 카카오 상태 정보입니다');
    }
  }

  @Post('/refresh')
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 액세스 토큰과 리프레시 토큰을 갱신합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: RefreshTokenResponseDto,
  })
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponseDto> {
    const { payload } = req;

    const refreshToken = req.cookies?.['refresh-token'];
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다');
    }

    const { token, isRegistered } = await this.authFacade.refreshToken(payload.authId, refreshToken);

    this.setAuthCookies(res, token);

    return {
      isRegistered,
    };
  }

  @Post('/logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '사용자를 로그아웃시키고 쿠키를 삭제합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '로그아웃 성공',
  })
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response): Promise<void> {
    const { payload } = req;

    await this.authFacade.logout(payload.authId);
    this.clearAuthCookies(res);

    res.status(204).send();
  }

  @Post('/register')
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
  @AllowNotRegistered()
  async register(@Req() req: AuthenticatedRequest, @Body() body: RegisterRequestDto): Promise<void> {
    const { payload } = req;

    const { authId } = payload;
    const { name, phoneNumber, university } = body;

    await this.authFacade.register(authId, name, phoneNumber, university);

    return;
  }

  @Get('/check')
  @ApiOperation({
    summary: '로그인 여부 확인',
    description: '쿠키를 통해 사용자가 로그인되었는지 여부를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인된 상태',
  })
  @ApiResponse({
    status: 401,
    description: '로그인되지 않은 상태',
  })
  checkLogin(): void {
    // 이 엔드포인트는 로그인 상태를 확인하기 위한 것으로, 실제로는 아무 작업도 하지 않습니다.
    // JwtAuthGuard가 쿠키를 검사하여 로그인 상태를 확인합니다.
    return;
  }

  private setAuthCookies(res: Response, token: { accessToken: string; refreshToken: string }): void {
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
  }

  private clearAuthCookies(res: Response): void {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.clearCookie('access-token', cookieOptions);
    res.clearCookie('refresh-token', cookieOptions);
  }

  private createRedirectUrl(callbackUrl: string, params: Record<string, string>): string {
    try {
      // URL 객체로 파싱하여 안전하게 처리
      const url = new URL(callbackUrl);

      // 기존 쿼리 파라미터 유지하면서 새 파라미터 추가
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      return url.toString();
    } catch {
      // URL 파싱 실패 시 기본 URL로 폴백
      const defaultUrl = new URL('http://localhost:3000/auth/callback');
      Object.entries(params).forEach(([key, value]) => {
        defaultUrl.searchParams.set(key, value);
      });
      return defaultUrl.toString();
    }
  }
}
