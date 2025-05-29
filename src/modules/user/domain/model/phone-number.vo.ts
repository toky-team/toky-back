import { HttpStatus } from '@nestjs/common';

import { ValueObject } from '~/libs/domain-core/value-object';
import { DomainException } from '~/libs/exceptions/domain-exception';

interface PhoneNumberProps {
  value: string;
}

export class PhoneNumberVO extends ValueObject<PhoneNumberProps> {
  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  public static create(phoneNumber: string): PhoneNumberVO {
    // 한국 전화번호 형식 검증
    const regex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!regex.test(phoneNumber)) {
      throw new DomainException(
        'USER',
        '유효하지 않은 전화번호 형식입니다. 올바른 형식은 01X-XXXX-XXXX 또는 01XXXXXXXXX입니다.',
        HttpStatus.BAD_REQUEST
      );
    }

    return new PhoneNumberVO({ value: this.format(phoneNumber) });
  }

  // 포맷팅된 전화번호 (하이픈 포함) 반환
  public get formatted(): string {
    return this.props.value;
  }

  // 원시 값만 반환 (하이픈 제거)
  public get value(): string {
    return this.props.value.replace(/-/g, '');
  }

  // 전화번호 포맷팅 (xxx-xxxx-xxxx 형식으로)
  private static format(phoneNumber: string): string {
    const digits = phoneNumber.replace(/-/g, '');

    if (digits.length === 11) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 7)}-${digits.substring(7)}`;
    } else if (digits.length === 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
    }

    return digits; // 기본 형식이 아니면 그대로 반환
  }

  override toString(): string {
    return this.formatted;
  }
}
