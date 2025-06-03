import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { KakaoClient } from '~/modules/auth/application/port/out/kakao-client.port';

@Injectable()
export class KakaoClientImpl extends KakaoClient {
  private readonly kakaoClientId: string;
  private readonly kakaoRedirectUri: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.kakaoClientId = this.configService.getOrThrow<string>('KAKAO_CLIENT_ID');
    this.kakaoRedirectUri = this.configService.getOrThrow<string>('KAKAO_REDIRECT_URI');
  }

  async getKakaoUserId(code: string): Promise<string | null> {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.kakaoClientId);
    params.append('redirect_uri', this.kakaoRedirectUri);
    params.append('code', code);

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      throw new DomainException('AUTH', '카카오 토큰 요청 실패', tokenResponse.status);
    }

    const tokenResponseData: KakaoTokenResponse = await tokenResponse.json();

    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenResponseData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new DomainException('AUTH', '카카오 유저 정보 조회 실패', userResponse.status);
    }

    const userResponseData: KakaoUserResponse = await userResponse.json();
    return userResponseData.id.toString();
  }
}

interface KakaoTokenResponse {
  token_type: string;
  access_token: string;
  id_token?: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    profile?: {
      nickname?: string;
    };
    email?: string;
  };
}
