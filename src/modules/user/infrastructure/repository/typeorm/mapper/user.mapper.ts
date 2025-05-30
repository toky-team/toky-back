import { DateUtil } from '~/libs/utils/date.util';
import { User } from '~/modules/user/domain/model/user';
import { UserEntity } from '~/modules/user/infrastructure/repository/typeorm/entity/user.entity';

export class UserMapper {
  static toEntity(user: User): UserEntity {
    const primitives = user.toPrimitives();
    const entity = new UserEntity();
    entity.id = primitives.id;
    entity.name = primitives.name;
    entity.phoneNumber = primitives.phoneNumber;
    entity.university = primitives.university;
    entity.createdAt = DateUtil.toUtcDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toUtcDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toUtcDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: UserEntity): User {
    return User.reconstruct({
      id: entity.id,
      name: entity.name,
      phoneNumber: entity.phoneNumber,
      university: entity.university,
      createdAt: DateUtil.toKst(entity.createdAt),
      updatedAt: DateUtil.toKst(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.toKst(entity.deletedAt) : null,
    });
  }
}
