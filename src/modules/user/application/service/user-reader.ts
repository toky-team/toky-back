import { Injectable } from '@nestjs/common';

import { UserFindFilter, UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { User } from '~/modules/user/domain/model/user';

@Injectable()
export class UserReader {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findMany(filter: UserFindFilter): Promise<User[]> {
    return this.userRepository.findMany(filter);
  }

  async existsByName(name: string): Promise<boolean> {
    const users = await this.userRepository.findMany({ name });
    return users.length > 0;
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const users = await this.userRepository.findMany({ phoneNumber });
    return users.length > 0;
  }
}
