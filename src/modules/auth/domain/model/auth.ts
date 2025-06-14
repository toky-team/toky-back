import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { AuthRegisteredEvent } from '~/modules/auth/domain/events/auth-registered.event';
import { ProviderType, ProviderVO } from '~/modules/auth/domain/model/provider.vo';
import { RefreshTokenVO } from '~/modules/auth/domain/model/refresh-token.vo';

export interface AuthPrimitives {
  id: string;
  userId: string | null;
  providerType: ProviderType;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  refreshTokens: {
    token: string;
    expiresAt: string;
  }[];
}

type AuthDomainEvent = AuthRegisteredEvent;

export class Auth extends AggregateRoot<AuthPrimitives, AuthDomainEvent> {
  private _userId: string | null;
  private _provider: ProviderVO;
  private _refreshTokens: RefreshTokenVO[];

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    userId: string | null,
    provider: ProviderVO,
    refreshTokens: RefreshTokenVO[] = []
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._provider = provider;
    this._refreshTokens = refreshTokens;
  }

  public static create(id: string, userId: string | null, providerType: ProviderType, providerId: string): Auth {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('AUTH', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (userId !== null && userId.trim().length === 0) {
      throw new DomainException('AUTH', 'User ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const provider = ProviderVO.create(providerType, providerId);

    return new Auth(id, now, now, null, userId, provider);
  }

  public get userId(): string | null {
    return this._userId;
  }

  public get provider(): ProviderVO {
    return this._provider;
  }

  public get refreshTokens(): RefreshTokenVO[] {
    return this._refreshTokens;
  }

  public get isRegistered(): boolean {
    return this._userId !== null;
  }

  public registerUser(userId: string): void {
    if (this.isRegistered) {
      throw new DomainException('AUTH', '이미 사용자 ID가 등록되어 있습니다', HttpStatus.BAD_REQUEST);
    }
    if (!userId || userId.trim().length === 0) {
      throw new DomainException('AUTH', '사용자 ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    this._userId = userId;

    this.touch();

    this.addEvent(new AuthRegisteredEvent(this.id, userId, this.provider.type, this.updatedAt));
  }

  public saveRefreshToken(token: string, expiresAt: Dayjs): RefreshTokenVO {
    this._refreshTokens = this._refreshTokens.filter((t) => t.token !== token);
    const newToken = RefreshTokenVO.create(token, expiresAt);
    this._refreshTokens.push(newToken);
    this.removeExpiredRefreshTokens();
    this.touch();
    return newToken;
  }

  public verifyRefreshToken(token: string): void {
    const foundToken = this._refreshTokens.find((t) => t.token === token);
    if (!foundToken) {
      throw new DomainException('AUTH', '유효하지 않은 리프레시 토큰입니다', HttpStatus.UNAUTHORIZED);
    }
    this.removeRefreshToken(token);
    if (foundToken.isExpired()) {
      throw new DomainException('AUTH', '리프레시 토큰이 만료되었습니다', HttpStatus.UNAUTHORIZED);
    }

    this.touch();
  }

  public toPrimitives(): AuthPrimitives {
    return {
      id: this.id,
      userId: this._userId,
      providerType: this._provider.type,
      providerId: this._provider.id,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
      refreshTokens: this._refreshTokens.map((token) => ({
        token: token.token,
        expiresAt: DateUtil.formatDate(token.expiresAt),
      })),
    };
  }

  public static reconstruct(primitives: AuthPrimitives): Auth {
    const provider = ProviderVO.create(primitives.providerType, primitives.providerId);
    const refreshTokens = primitives.refreshTokens.map((token) =>
      RefreshTokenVO.create(token.token, DateUtil.toKst(token.expiresAt))
    );
    return new Auth(
      primitives.id,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null,
      primitives.userId,
      provider,
      refreshTokens
    );
  }

  private removeRefreshToken(token: string): void {
    this._refreshTokens = this._refreshTokens.filter((t) => t.token !== token);
  }

  private removeExpiredRefreshTokens(): void {
    this._refreshTokens = this._refreshTokens.filter((token) => !token.isExpired());
  }
}
