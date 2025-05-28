import { Injectable } from '@nestjs/common';

import { UserReader } from '~/modules/user/application/port/in/user-reader.port';
import { UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { User } from '~/modules/user/domain/model/user';

@Injectable()
export class UserReaderImpl extends UserReader {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
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
