import { Auth } from '~/modules/auth/domain/model/auth';
import { AuthEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/auth.entity';

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
    });
  }
}
