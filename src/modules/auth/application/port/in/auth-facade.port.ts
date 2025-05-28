import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export abstract class AuthFacade {
  abstract kakaoLogin(kakaoId: string): Promise<LoginResultDto>;
  abstract kopasLogin(id: string, password: string): Promise<LoginResultDto>;
  abstract refreshToken(authId: string, refreshToken: string): Promise<LoginResultDto>;
  abstract findUserIdFromJwtPayload(jwtPayload: JwtPayload): Promise<string | null>;
  abstract register(authId: string, name: string, phoneNumber: string, university: string): Promise<void>;
  abstract connectOtherAuth(userId: string, providerType: ProviderType, providerId: string): Promise<void>;
}
