import { ProviderType } from '~/modules/auth/domain/model/provider.vo';

export interface JwtPayload {
  authId: string;
  providerType: ProviderType;
  providerId: string;
  isRegistered: boolean;
}
