import { Injectable } from '@nestjs/common';

import { AuthPersister } from '~/modules/auth/application/port/in/auth-persister.port';
import { AuthRepository } from '~/modules/auth/application/port/out/auth-repository.port';
import { Auth } from '~/modules/auth/domain/model/auth';

@Injectable()
export class AuthPersisterImpl extends AuthPersister {
  constructor(private readonly authRepository: AuthRepository) {
    super();
  }

  async save(auth: Auth): Promise<void> {
    await this.authRepository.save(auth);
  }

  async saveAll(auths: Auth[]): Promise<void> {
    await this.authRepository.saveAll(auths);
  }
}
