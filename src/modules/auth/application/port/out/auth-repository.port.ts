import { Repository } from '~/libs/core/application-core/repository.interface';
import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export abstract class AuthRepository extends Repository<Auth> {
  abstract findByProvider(providerType: ProviderType, providerId: string): Promise<Auth | null>;
}
