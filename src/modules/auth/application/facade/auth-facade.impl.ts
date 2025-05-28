import { Injectable } from '@nestjs/common';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthPersister } from '~/modules/auth/application/port/in/auth-persister.port';
import { AuthReader } from '~/modules/auth/application/port/in/auth-reader.port';
import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

@Injectable()
export class AuthFacadeImpl extends AuthFacade {
  constructor(
    private readonly authReader: AuthReader,
    private readonly authPersister: AuthPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async login(providerType: ProviderType, providerId: string): Promise<string> {
    let auth = await this.authReader.findByProvider(providerType, providerId);
    if (!auth) {
      auth = Auth.create(this.idGenerator.generateId(), null, providerType, providerId);
      await this.authPersister.save(auth);
    }

    // token 반환하도록 수정
    return `Login successful for provider ${providerType} with ID ${providerId}. Auth ID: ${auth.id}. IsRegistered: ${auth.isRegistered}`;
  }

  async register(authId: string, userId: string): Promise<void> {
    const auth = await this.authReader.findById(authId);
    if (!auth) {
      throw new Error(`Auth with ID ${authId} not found.`);
    }

    auth.registerUser(userId);
    await this.authPersister.save(auth);
  }

  async connectOtherAuth(userId: string, providerType: ProviderType, providerId: string): Promise<void> {
    let auth = await this.authReader.findByProvider(providerType, providerId);
    if (!auth) {
      auth = Auth.create(this.idGenerator.generateId(), userId, providerType, providerId);
      await this.authPersister.save(auth);
    } else {
      if (auth.userId && auth.userId !== userId) {
        throw new Error(`Provider ${providerType} with ID ${providerId} is already connected to another user.`);
      }
      auth.registerUser(userId);
      await this.authPersister.save(auth);
    }
  }
}
