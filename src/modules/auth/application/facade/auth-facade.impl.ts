import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthPersister } from '~/modules/auth/application/port/in/auth-persister.port';
import { AuthReader } from '~/modules/auth/application/port/in/auth-reader.port';
import { KopasClient } from '~/modules/auth/application/port/out/kopas-client.port';
import { TokenService } from '~/modules/auth/application/service/token.service';
import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Injectable()
export class AuthFacadeImpl extends AuthFacade {
  constructor(
    private readonly authReader: AuthReader,
    private readonly authPersister: AuthPersister,
    private readonly tokenService: TokenService,
    private readonly kopasClient: KopasClient,

    private readonly userInvoker: UserInvoker,
    private readonly idGenerator: IdGenerator,
    private readonly configService: ConfigService
  ) {
    super();
  }

  @Transactional()
  async kakaoLogin(kakaoId: string): Promise<LoginResultDto> {
    return this.login(ProviderType.KAKAO, kakaoId);
  }

  @Transactional()
  async kopasLogin(id: string, password: string): Promise<LoginResultDto> {
    const kopasUserId = await this.kopasClient.getKopasUserId(id, password);
    if (!kopasUserId) {
      throw new Error('Invalid Kopas credentials');
    }
    return this.login(ProviderType.KOPAS, kopasUserId);
  }

  private async login(providerType: ProviderType, providerId: string): Promise<LoginResultDto> {
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

  @Transactional()
  async refreshToken(authId: string, refreshToken: string): Promise<LoginResultDto> {
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

    return {
      token,
      isRegistered: auth.isRegistered,
    };
  }

  async findUserIdFromJwtPayload(jwtPayload: JwtPayload): Promise<string | null> {
    const { authId } = jwtPayload;
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new Error(`Auth with ID ${authId} not found.`);
    }

    return auth.userId;
  }

  @Transactional()
  async register(authId: string, name: string, phoneNumber: string, university: string): Promise<void> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new Error(`Auth with ID ${authId} not found.`);
    }

    const user = await this.userInvoker.createUser(name, phoneNumber, university);
    auth.registerUser(user.id);
    await this.authPersister.save(auth);
  }

  @Transactional()
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
