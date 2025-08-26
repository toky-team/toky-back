import { Injectable, UnauthorizedException } from '@nestjs/common';
import { parse } from 'cookie';

import { AuthenticatedClient } from '~/libs/interfaces/authenticated-client.interface';
import { ExceptionFormat } from '~/libs/interfaces/exception-format.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { AuthInvoker } from '~/modules/auth/application/port/in/auth-invoker.port';

@Injectable()
export class WsJwtAuthMiddleware {
  constructor(private readonly authInvoker: AuthInvoker) {}

  async authenticate(socket: AuthenticatedClient, next: (err?: Error) => void): Promise<void> {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = parse(cookieHeader || '');
      const token = cookies['access-token'];

      if (typeof token !== 'string' || !token) {
        throw new UnauthorizedException('토큰이 제공되지 않았습니다');
      }

      const { payload, userId } = await this.authInvoker.validateJwtToken(token);

      if (!userId) {
        throw new UnauthorizedException('사용자가 등록되지 않았습니다');
      }

      // 사용자 정보를 소켓 객체에 추가
      socket.payload = payload;
      socket.user = { userId };

      next();
    } catch (e) {
      const exceptionResponse: ExceptionFormat = {
        status: 401,
        error: 'Unauthorized',
        message: e instanceof UnauthorizedException ? e.message : '유효하지 않은 토큰입니다',
        timestamp: DateUtil.format(DateUtil.now()),
        context: 'WebSocket',
      };
      const error = new UnauthorizedException(JSON.stringify(exceptionResponse));
      next(error);
    }
  }
}
