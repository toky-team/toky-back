import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { DateUtil } from '~/libs/utils/date.util';

interface RefreshTokenProps {
  token: string;
  expiresAt: Dayjs;
}

export class RefreshTokenVO extends ValueObject<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps) {
    super(props);
  }

  public static create(token: string, expiresAt: Dayjs): RefreshTokenVO {
    if (!token || token.trim().length === 0) {
      throw new DomainException('AUTH', '토큰은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (!expiresAt || !expiresAt.isValid()) {
      throw new DomainException('AUTH', '유효하지 않은 만료일입니다', HttpStatus.BAD_REQUEST);
    }

    return new RefreshTokenVO({ token: token.trim(), expiresAt });
  }

  public get token(): string {
    return this.props.token;
  }

  public get expiresAt(): Dayjs {
    return this.props.expiresAt;
  }

  public isExpired(): boolean {
    return DateUtil.now().isAfter(this.expiresAt);
  }
}
