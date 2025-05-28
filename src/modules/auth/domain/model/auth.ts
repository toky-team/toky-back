import { AggregateRoot } from '~/libs/domain-core/aggregate-root';
import { AuthRegisteredEvent } from '~/modules/auth/domain/events/auth-registered.event';
import { ProviderType, ProviderVO } from '~/modules/auth/domain/model/provider.vo';

export interface AuthPrimitives {
  id: string;
  userId: string | null;
  providerType: ProviderType;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type AuthDomainEvent = AuthRegisteredEvent;

export class Auth extends AggregateRoot<AuthPrimitives, AuthDomainEvent> {
  private _userId: string | null;
  private _provider: ProviderVO;

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    userId: string | null,
    provider: ProviderVO
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._userId = userId;
    this._provider = provider;
  }

  public static create(id: string, userId: string | null, providerType: ProviderType, providerId: string): Auth {
    const now = new Date();

    if (!id || id.trim().length === 0) {
      throw new Error('ID는 비어있을 수 없습니다');
    }

    if (userId !== null && userId.trim().length === 0) {
      throw new Error('User ID는 비어있을 수 없습니다');
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

  public get isRegistered(): boolean {
    return this._userId !== null;
  }

  public registerUser(userId: string): void {
    if (this.isRegistered) {
      throw new Error('이미 사용자 ID가 등록되어 있습니다');
    }
    if (!userId || userId.trim().length === 0) {
      throw new Error('사용자 ID는 비어있을 수 없습니다');
    }
    this._userId = userId;

    this.touch();

    this.addEvent(new AuthRegisteredEvent(this.id, userId, this._provider.type, this.updatedAt));
  }

  public toPrimitives(): AuthPrimitives {
    return {
      id: this.id,
      userId: this._userId,
      providerType: this._provider.type,
      providerId: this._provider.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: AuthPrimitives): Auth {
    const provider = ProviderVO.create(primitives.providerType, primitives.providerId);
    return new Auth(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.userId,
      provider
    );
  }
}
