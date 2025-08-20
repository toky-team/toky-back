import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

interface GiftImageProps {
  url: string;
  key: string;
}

export class GiftImageVO extends ValueObject<GiftImageProps> {
  private constructor(props: GiftImageProps) {
    super(props);
  }

  public static create(url: string, key: string): GiftImageVO {
    const newGiftImage = new GiftImageVO({ url, key });
    newGiftImage.validate();
    return newGiftImage;
  }

  private validate(): void {
    if (!this.props.url || !this.props.key) {
      throw new DomainException('GIFT', 'Invalid gift image data', HttpStatus.BAD_REQUEST);
    }
  }

  get url(): string {
    return this.props.url;
  }

  get key(): string {
    return this.props.key;
  }

  override toString(): string {
    return `GiftImage(url: ${this.url}, key: ${this.key})`;
  }
}
