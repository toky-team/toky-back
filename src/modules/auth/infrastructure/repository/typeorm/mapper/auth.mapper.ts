import { Auth } from '~/modules/auth/domain/model/auth';
import { AuthEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/auth.entity';
import { RefreshTokenEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/refresh-token.entity';

export class AuthMapper {
  static toEntity(domain: Auth): AuthEntity {
    const primitives = domain.toPrimitives();
    const entity = new AuthEntity();
    entity.id = primitives.id;
    entity.userId = primitives.userId;
    entity.providerType = primitives.providerType;
    entity.providerId = primitives.providerId;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;
    entity.deletedAt = primitives.deletedAt;
    entity.refreshTokens = primitives.refreshTokens.map((token) => {
      const refreshTokenEntity = new RefreshTokenEntity();
      refreshTokenEntity.authId = primitives.id;
      refreshTokenEntity.token = token.token;
      refreshTokenEntity.expiresAt = token.expiresAt;
      return refreshTokenEntity;
    });
    return entity;
  }

  static toDomain(entity: AuthEntity): Auth {
    return Auth.reconstruct({
      id: entity.id,
      userId: entity.userId,
      providerType: entity.providerType,
      providerId: entity.providerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      refreshTokens: entity.refreshTokens.map((token) => ({
        token: token.token,
        expiresAt: token.expiresAt,
      })),
    });
  }
}
