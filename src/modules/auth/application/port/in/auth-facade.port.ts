import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';

export abstract class AuthFacade {
  abstract kakaoLogin(code: string): Promise<LoginResultDto>;
  abstract kopasLogin(id: string, password: string): Promise<LoginResultDto>;
  abstract refreshToken(authId: string, refreshToken: string): Promise<LoginResultDto>;
  abstract register(authId: string, name: string, phoneNumber: string, university: string): Promise<void>;
  abstract connectKakao(userId: string, code: string): Promise<void>;
  abstract connectKopas(userId: string, id: string, password: string): Promise<void>;
  abstract validateJwtToken(token: string): Promise<{ payload: JwtPayload; userId: string | null }>;
}
