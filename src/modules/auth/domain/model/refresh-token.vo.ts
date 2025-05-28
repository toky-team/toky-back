import { ValueObject } from '~/libs/domain-core/value-object';

interface RefreshTokenProps {
  token: string;
  expiresAt: Date;
}

export class RefreshTokenVO extends ValueObject<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps) {
    super(props);
  }

  public static create(token: string, expiresAt: Date): RefreshTokenVO {
    if (!token || token.trim().length === 0) {
      throw new Error('token은 비어있을 수 없습니다');
    }
    if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
      throw new Error('유효하지 않은 만료일입니다');
    }

    return new RefreshTokenVO({ token: token.trim(), expiresAt });
  }

  public get token(): string {
    return this.props.token;
  }

  public get expiresAt(): Date {
    return this.props.expiresAt;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
