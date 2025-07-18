import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

interface ProfileImageProps {
  url: string;
  key: string;
}

export class ProfileImageVO extends ValueObject<ProfileImageProps> {
  private constructor(props: ProfileImageProps) {
    super(props);
  }

  public static create(url: string, key: string): ProfileImageVO {
    const newProfileImage = new ProfileImageVO({ url, key });
    newProfileImage.validate();
    return newProfileImage;
  }

  private validate(): void {
    if (!this.props.url || !this.props.key) {
      throw new DomainException('PLAYER', 'Invalid profile image data', HttpStatus.BAD_REQUEST);
    }
  }

  get url(): string {
    return this.props.url;
  }

  get key(): string {
    return this.props.key;
  }

  override toString(): string {
    return `ProfileImage(url: ${this.url}, key: ${this.key})`;
  }
}
