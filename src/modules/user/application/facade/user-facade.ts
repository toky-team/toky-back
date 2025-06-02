import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { DomainException } from '~/libs/exceptions/domain-exception';
import { IdGenerator } from '~/modules/common/application/port/in/id-generator.interface';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserPersister } from '~/modules/user/application/service/user-persister';
import { UserReader } from '~/modules/user/application/service/user-reader';
import { User, UserPrimitives } from '~/modules/user/domain/model/user';

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
  async createUser(name: string, phoneNumber: string, university: string): Promise<UserPrimitives> {
    if (await this.userReader.existsByName(name)) {
      throw new DomainException('USER', `해당 이름의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }
    if (await this.userReader.existsByPhoneNumber(phoneNumber)) {
      throw new DomainException('USER', `해당 전화번호의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }
    const user = User.create(this.idGenerator.generateId(), name, phoneNumber, university);
    await this.userPersister.save(user);
    return user.toPrimitives();
  }

  async getUserById(id: string): Promise<UserPrimitives> {
    const user = await this.userReader.findById(id);
    if (user === null) {
      throw new DomainException('USER', `해당 ID의 사용자를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    return user.toPrimitives();
  }
}
