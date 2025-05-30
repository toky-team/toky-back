import { DateUtil } from '~/libs/utils/date.util';
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
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    entity.refreshTokens = primitives.refreshTokens.map((token) => {
      const refreshTokenEntity = new RefreshTokenEntity();
      refreshTokenEntity.authId = primitives.id;
      refreshTokenEntity.token = token.token;
      refreshTokenEntity.expiresAt = DateUtil.toUtcDate(token.expiresAt);
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
      createdAt: DateUtil.toKst(entity.createdAt),
      updatedAt: DateUtil.toKst(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.toKst(entity.deletedAt) : null,
      refreshTokens: entity.refreshTokens.map((token) => ({
        token: token.token,
        expiresAt: DateUtil.toKst(token.expiresAt),
      })),
    });
  }
}
