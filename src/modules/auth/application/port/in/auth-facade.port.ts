import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export abstract class AuthFacade {
  abstract login(providerType: ProviderType, providerId: string): Promise<string>;
  abstract register(authId: string, userId: string): Promise<void>;
  abstract connectOtherAuth(userId: string, providerType: ProviderType, providerId: string): Promise<void>;
}
