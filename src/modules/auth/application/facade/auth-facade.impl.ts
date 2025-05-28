import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { TokenDto } from '~/modules/auth/application/dto/token.dto';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthPersister } from '~/modules/auth/application/port/in/auth-persister.port';
import { AuthReader } from '~/modules/auth/application/port/in/auth-reader.port';
import { TokenService } from '~/modules/auth/application/service/token.service';
import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

@Injectable()
export class AuthFacadeImpl extends AuthFacade {
  constructor(
    private readonly authReader: AuthReader,
    private readonly authPersister: AuthPersister,
    private readonly tokenService: TokenService,

    private readonly idGenerator: IdGenerator,
    private readonly configService: ConfigService
  ) {
    super();
  }

  async login(providerType: ProviderType, providerId: string): Promise<LoginResultDto> {
    let auth = await this.authReader.findByProvider(providerType, providerId);
    if (!auth) {
      auth = Auth.create(this.idGenerator.generateId(), null, providerType, providerId);
      await this.authPersister.save(auth);
    }

    const token = this.tokenService.generateToken(auth);
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const expiresAt = new Date(Date.now() + ms(refreshTokenExpiresIn as StringValue));
    auth.saveRefreshToken(token.refreshToken, expiresAt);
    await this.authPersister.save(auth);

    return {
      token,
      isRegistered: auth.isRegistered,
    };
  }

  async refreshToken(authId: string, refreshToken: string): Promise<TokenDto> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new Error(`Auth with ID ${authId} not found.`);
    }
    auth.verifyRefreshToken(refreshToken);
    const token = this.tokenService.generateToken(auth);
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const expiresAt = new Date(Date.now() + ms(refreshTokenExpiresIn as StringValue));
    auth.saveRefreshToken(token.refreshToken, expiresAt);
    await this.authPersister.save(auth);

    return token;
  }

  async findUserIdFromJwtPayload(jwtPayload: JwtPayload): Promise<string | null> {
    const { authId } = jwtPayload;
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new Error(`Auth with ID ${authId} not found.`);
    }

    return auth.userId;
  }

  async register(authId: string, userId: string): Promise<void> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new Error(`Auth with ID ${authId} not found.`);
    }

    auth.registerUser(userId);
    await this.authPersister.save(auth);
  }

  async connectOtherAuth(userId: string, providerType: ProviderType, providerId: string): Promise<void> {
    let auth = await this.authReader.findByProvider(providerType, providerId);
    if (!auth) {
      auth = Auth.create(this.idGenerator.generateId(), userId, providerType, providerId);
      await this.authPersister.save(auth);
    } else {
      auth.registerUser(userId);
      await this.authPersister.save(auth);
    }
  }
}
