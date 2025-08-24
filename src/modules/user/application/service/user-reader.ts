import { Injectable } from '@nestjs/common';

import { UserFindFilter, UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { User } from '~/modules/user/domain/model/user';

@Injectable()
export class UserReader {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const uniqueIds = [...new Set(ids)];
    const users = await this.userRepository.findByIds(uniqueIds);
    const byId = new Map(users.map((user) => [user.id, user]));
    const ordered = ids.map((id) => byId.get(id)).filter((user): user is User => !!user);

    return ordered;
  }

  async findUserIdByInviteCode(inviteCode: string): Promise<string | null> {
    const user = await this.userRepository.findByInviteCode(inviteCode);
    return user ? user.id : null;
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
