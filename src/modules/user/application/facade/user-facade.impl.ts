import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { DomainException } from '~/libs/exceptions/domain-exception';
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
      throw new DomainException('USER', `해당 이름의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }
    if (await this.userReader.existsByPhoneNumber(phoneNumber)) {
      throw new DomainException('USER', `해당 전화번호의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }
    const user = User.create(this.idGenerator.generateId(), name, phoneNumber, university);
    await this.userPersister.save(user);
    return user;
  }
}
