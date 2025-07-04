import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { KopasClient } from '~/modules/auth/application/port/out/kopas-client.port';

@Injectable()
export class KopasClientImpl extends KopasClient {
  private readonly kopasApiUrl: string;
  private readonly kopasApiKey: string;
  constructor(private readonly configService: ConfigService) {
    super();
    this.kopasApiUrl = this.configService.getOrThrow<string>('KOPAS_API_URL');
    this.kopasApiKey = this.configService.getOrThrow<string>('KOPAS_API_KEY');
  }
  async getKopasUserId(id: string, password: string): Promise<string | null> {
    const body: KopasRequest = {
      user_id: id,
      password: password,
      api_key: this.kopasApiKey,
    };

    const params = new URLSearchParams();
    params.append('user_id', body.user_id);
    params.append('password', body.password);
    params.append('api_key', body.api_key);

    const response = await fetch(this.kopasApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!response.ok) {
      throw new DomainException('AUTH', '고파스 로그인에 실패했습니다', response.status);
    }

    const responseData: KopasResponse = await response.json();
    return responseData.result ? responseData.data.uuid : null;
  }
}

interface KopasRequest {
  user_id: string;
  password: string;
  api_key: string;
}

interface KopasResponse {
  result: boolean;
  data: {
    uuid: string;
    nickname: string;
    level: string;
  };
  error: string;
}
