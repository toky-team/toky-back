import { Injectable } from '@nestjs/common';

import { UserPersister } from '~/modules/user/application/port/in/user-persister.port';
import { UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { User } from '~/modules/user/domain/model/user';

@Injectable()
export class UserPersisterImpl extends UserPersister {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async save(user: User): Promise<void> {
    await this.userRepository.save(user);
  }

  async saveAll(users: User[]): Promise<void> {
    await this.userRepository.saveAll(users);
  }
}
