import { Injectable } from '@nestjs/common';

import { AuthRepository } from '~/modules/auth/application/port/out/auth-repository.port';
import { Auth } from '~/modules/auth/domain/model/auth';

@Injectable()
export class AuthPersister {
  constructor(private readonly authRepository: AuthRepository) {}

  async save(auth: Auth): Promise<void> {
    await this.authRepository.save(auth);
  }

  async saveAll(auths: Auth[]): Promise<void> {
    await this.authRepository.saveAll(auths);
  }
}
