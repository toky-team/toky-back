import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { TokenDto } from '~/modules/auth/application/dto/token.dto';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export abstract class AuthFacade {
  abstract kakaoLogin(kakaoId: string): Promise<LoginResultDto>;
  abstract kopasLogin(id: string, password: string): Promise<LoginResultDto>;
  abstract refreshToken(authId: string, refreshToken: string): Promise<TokenDto>;
  abstract findUserIdFromJwtPayload(jwtPayload: JwtPayload): Promise<string | null>;
  abstract register(authId: string, userId: string): Promise<void>;
  abstract connectOtherAuth(userId: string, providerType: ProviderType, providerId: string): Promise<void>;
}
