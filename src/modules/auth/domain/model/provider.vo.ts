import { ValueObject } from '~/libs/domain-core/value-object';

export enum ProviderType {
  KAKAO = 'KAKAO',
  GOPAS = 'GOPAS',
}

interface ProviderProps {
  providerType: ProviderType;
  providerId: string;
}

export class ProviderVO extends ValueObject<ProviderProps> {
  private constructor(props: ProviderProps) {
    super(props);
  }

  public static create(providerType: ProviderType, providerId: string): ProviderVO {
    if (!Object.values(ProviderType).includes(providerType)) {
      throw new Error('유효하지 않은 providerType입니다');
    }

    if (!providerId || providerId.trim().length === 0) {
      throw new Error('providerId는 비어있을 수 없습니다');
    }

    return new ProviderVO({ providerType, providerId: providerId.trim() });
  }

  public get type(): ProviderType {
    return this.props.providerType;
  }

  public get id(): string {
    return this.props.providerId;
  }
}
