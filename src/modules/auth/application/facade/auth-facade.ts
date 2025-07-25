import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { JwtPayload } from '~/modules/auth/application/dto/jwt.payload';
import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { KakaoClient } from '~/modules/auth/application/port/out/kakao-client.port';
import { KopasClient } from '~/modules/auth/application/port/out/kopas-client.port';
import { SmsVerificationStore } from '~/modules/auth/application/port/out/sms-verification.store';
import { AuthPersister } from '~/modules/auth/application/service/auth-persister';
import { AuthReader } from '~/modules/auth/application/service/auth-reader';
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
    private readonly smsVerificationStore: SmsVerificationStore,

    private readonly userInvoker: UserInvoker,
    private readonly idGenerator: IdGenerator,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
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

  async sendVerificationCode(phoneNumber: string): Promise<void> {
    await this.smsVerificationStore.createVerificationCode(phoneNumber);
  }

  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    return await this.smsVerificationStore.verifyCode(phoneNumber, code);
  }

  async isVerified(phoneNumber: string): Promise<boolean> {
    return await this.smsVerificationStore.isVerified(phoneNumber);
  }

  @Transactional()
  async register(authId: string, name: string, phoneNumber: string, university: University): Promise<void> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new DomainException('AUTH', `계정 정보를 찾을 수 없습니다.`, HttpStatus.UNAUTHORIZED);
    }

    if (auth.isRegistered) {
      throw new DomainException('AUTH', `이미 회원가입이 완료된 계정입니다.`, HttpStatus.BAD_REQUEST);
    }

    const phoneNumberVerified = await this.smsVerificationStore.isVerified(phoneNumber);
    if (!phoneNumberVerified) {
      throw new DomainException('AUTH', 'SMS 인증이 완료되지 않았습니다.', HttpStatus.BAD_REQUEST);
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

  async validateJwtToken(token: string): Promise<{ payload: JwtPayload; userId: string | null }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const auth = await this.authReader.findById(payload.authId);
      if (!auth) {
        throw new DomainException('AUTH', `계정 정보를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
      }
      const userId = auth.userId;
      return { payload, userId };
    } catch (e) {
      if (e instanceof DomainException) {
        throw e;
      }
      throw new DomainException('AUTH', `유효하지 않은 토큰입니다.`, HttpStatus.UNAUTHORIZED);
    }
  }

  @Transactional()
  async logout(authId: string): Promise<void> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new DomainException('AUTH', `계정 정보를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    auth.clearRefreshTokens();
    await this.authPersister.save(auth);
  }
}
