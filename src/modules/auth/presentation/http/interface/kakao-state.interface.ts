import { BadRequestException } from '@nestjs/common';

export interface KakaoState {
  mode: 'login' | 'connect';
  callbackUrl: string;
  userId?: string;
}

export const encodeKakaoState = (state: KakaoState): string => {
  const json = JSON.stringify(state);
  return encodeURIComponent(Buffer.from(json, 'utf8').toString('base64url'));
};

export const decodeKakaoState = (raw: string): KakaoState => {
  try {
    const decoded = Buffer.from(decodeURIComponent(raw), 'base64url').toString('utf8');
    const parsed: KakaoState = JSON.parse(decoded);

    if (!parsed.mode || !parsed.callbackUrl) {
      throw new BadRequestException('카카오 상태 정보가 유효하지 않습니다');
    }

    if (!['login', 'connect'].includes(parsed.mode)) {
      throw new BadRequestException('mode는 "login" 또는 "connect"이어야 합니다');
    }

    return parsed;
  } catch {
    throw new BadRequestException('카카오 상태 정보 복호화에 실패했습니다');
  }
};
