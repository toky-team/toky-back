import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/modules/common/application/port/in/id-generator.interface';
import { DomainException } from '~/libs/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthPersister } from '~/modules/auth/application/port/in/auth-persister.port';
import { AuthReader } from '~/modules/auth/application/port/in/auth-reader.port';
import { KakaoClient } from '~/modules/auth/application/port/out/kakao-client.port';
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
    private readonly kakaoClient: KakaoClient,

    private readonly userInvoker: UserInvoker,
    private readonly idGenerator: IdGenerator,
    private readonly configService: ConfigService
  ) {
    super();
  }

  @Transactional()
  async kakaoLogin(code: string): Promise<LoginResultDto> {
    const kakaoUserId = await this.kakaoClient.getKakaoUserId(code);
    if (!kakaoUserId) {
      throw new DomainException('AUTH', '카카오 로그인에 실패했습니다', HttpStatus.UNAUTHORIZED);
    }
    return this.login(ProviderType.KAKAO, kakaoUserId);
  }

  @Transactional()
  async kopasLogin(id: string, password: string): Promise<LoginResultDto> {
    const kopasUserId = await this.kopasClient.getKopasUserId(id, password);
    if (!kopasUserId) {
      throw new DomainException('AUTH', '고파스 로그인에 실패했습니다', HttpStatus.UNAUTHORIZED);
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
    const expiresAt = DateUtil.now().add(ms(refreshTokenExpiresIn as StringValue), 'ms');
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
      throw new DomainException('AUTH', `계정 정보를 찾을 수 없습니다.`, HttpStatus.UNAUTHORIZED);
    }
    auth.verifyRefreshToken(refreshToken);
    const token = this.tokenService.generateToken(auth);
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const expiresAt = DateUtil.now().add(ms(refreshTokenExpiresIn as StringValue), 'ms');
    auth.saveRefreshToken(token.refreshToken, expiresAt);
    await this.authPersister.save(auth);

    return {
      token,
      isRegistered: auth.isRegistered,
    };
  }

  @Transactional()
  async register(authId: string, name: string, phoneNumber: string, university: string): Promise<void> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new DomainException('AUTH', `계정 정보를 찾을 수 없습니다.`, HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userInvoker.createUser(name, phoneNumber, university);
    auth.registerUser(user.id);
    await this.authPersister.save(auth);
  }

  @Transactional()
  async connectKakao(userId: string, code: string): Promise<void> {
    const kakaoUserId = await this.kakaoClient.getKakaoUserId(code);
    if (!kakaoUserId) {
      throw new DomainException('AUTH', '카카오 로그인에 실패했습니다', HttpStatus.UNAUTHORIZED);
    }
    await this.connectOtherAuth(userId, ProviderType.KAKAO, kakaoUserId);
  }

  @Transactional()
  async connectKopas(userId: string, id: string, password: string): Promise<void> {
    const kopasUserId = await this.kopasClient.getKopasUserId(id, password);
    if (!kopasUserId) {
      throw new DomainException('AUTH', '고파스 로그인에 실패했습니다', HttpStatus.UNAUTHORIZED);
    }
    await this.connectOtherAuth(userId, ProviderType.KOPAS, kopasUserId);
  }

  private async connectOtherAuth(userId: string, providerType: ProviderType, providerId: string): Promise<void> {
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
