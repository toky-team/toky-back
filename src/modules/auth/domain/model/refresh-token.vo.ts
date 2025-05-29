import { HttpStatus } from '@nestjs/common';

import { ValueObject } from '~/libs/domain-core/value-object';
import { DomainException } from '~/libs/exceptions/domain-exception';

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
      throw new DomainException('AUTH', '토큰은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
      throw new DomainException('AUTH', '유효하지 않은 만료일입니다', HttpStatus.BAD_REQUEST);
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
