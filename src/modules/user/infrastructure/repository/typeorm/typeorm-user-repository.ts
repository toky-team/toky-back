import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { UserFindFilter, UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { User } from '~/modules/user/domain/model/user';
import { UserEntity } from '~/modules/user/infrastructure/repository/typeorm/entity/user.entity';
import { UserMapper } from '~/modules/user/infrastructure/repository/typeorm/mapper/user.mapper';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepo: Repository<UserEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: User): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(user: User): Promise<void> {
    const entity = UserMapper.toEntity(user);
    await this.ormRepo.save(entity);
    await this.emitEvent(user);
  }

  async saveAll(users: User[]): Promise<void> {
    const entities = users.map((user) => UserMapper.toEntity(user));
    await this.ormRepo.save(entities);
    await Promise.all(users.map((user) => this.emitEvent(user)));
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByInviteCode(inviteCode: string): Promise<User | null> {
    const entity = await this.ormRepo.findOne({ where: { inviteCode } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => UserMapper.toDomain(e));
  }

  async findMany(filter: UserFindFilter): Promise<User[]> {
    const entities = await this.ormRepo.find({
      where: {
        name: filter.name,
        phoneNumber: filter.phoneNumber,
        university: filter.university,
        createdAt: filter.createdAtAfter ? MoreThanOrEqual(DateUtil.toUtcDate(filter.createdAtAfter)) : undefined,
      },
    });
    return entities.map((e) => UserMapper.toDomain(e));
  }
}
