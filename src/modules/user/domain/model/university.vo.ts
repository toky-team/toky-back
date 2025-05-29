import { HttpStatus } from '@nestjs/common';

import { ValueObject } from '~/libs/domain-core/value-object';
import { DomainException } from '~/libs/exceptions/domain-exception';

interface UniversityProps {
  name: string;
}

export class UniversityVO extends ValueObject<UniversityProps> {
  private constructor(props: UniversityProps) {
    super(props);
  }

  public static create(name: string): UniversityVO {
    // 유효성 검증
    if (!name || name.trim().length === 0) {
      throw new DomainException('USER', '대학교 이름은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    // 길이 제한
    if (name.trim().length > 50) {
      throw new DomainException('USER', '대학교 이름은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    return new UniversityVO({ name: name.trim() });
  }

  // 대학교 이름 반환
  public get name(): string {
    return this.props.name;
  }

  override toString(): string {
    return this.name;
  }
}
