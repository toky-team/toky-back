import { Injectable } from '@nestjs/common';

import { AuthRepository } from '~/modules/auth/application/port/out/auth-repository.port';
import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

@Injectable()
export class AuthReader {
  constructor(private readonly authRepository: AuthRepository) {}

  async findById(id: string): Promise<Auth | null> {
    return this.authRepository.findById(id);
  }

  async findByProvider(providerType: ProviderType, providerId: string): Promise<Auth | null> {
    return this.authRepository.findByProvider(providerType, providerId);
  }
}
