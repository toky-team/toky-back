import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserPersister } from '~/modules/user/application/port/in/user-persister.port';
import { UserReader } from '~/modules/user/application/port/in/user-reader.port';
import { User } from '~/modules/user/domain/model/user';

@Injectable()
export class UserFacadeImpl extends UserFacade {
  constructor(
    private readonly userReader: UserReader,
    private readonly userPersister: UserPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async createUser(name: string, phoneNumber: string, university: string): Promise<User> {
    if (await this.userReader.existsByName(name)) {
      throw new Error(`User with name ${name} already exists.`);
    }
    if (await this.userReader.existsByPhoneNumber(phoneNumber)) {
      throw new Error(`User with phone number ${phoneNumber} already exists.`);
    }
    const user = User.create(this.idGenerator.generateId(), name, phoneNumber, university);
    await this.userPersister.save(user);
    return user;
  }
}
