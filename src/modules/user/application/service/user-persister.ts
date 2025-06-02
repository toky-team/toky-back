import { Injectable } from '@nestjs/common';

import { UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { User } from '~/modules/user/domain/model/user';

@Injectable()
export class UserPersister {
  constructor(private readonly userRepository: UserRepository) {}

  async save(user: User): Promise<void> {
    await this.userRepository.save(user);
  }

  async saveAll(users: User[]): Promise<void> {
    await this.userRepository.saveAll(users);
  }
}
