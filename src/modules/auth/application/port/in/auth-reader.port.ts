import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export abstract class AuthReader {
  abstract findById(id: string): Promise<Auth | null>;
  abstract findByProvider(providerType: ProviderType, providerId: string): Promise<Auth | null>;
}
