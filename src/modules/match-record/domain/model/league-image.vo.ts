import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

interface LeagueImageProps {
  url: string;
  key: string;
}

export class LeagueImageVO extends ValueObject<LeagueImageProps> {
  private constructor(props: LeagueImageProps) {
    super(props);
  }

  public static create(url: string, key: string): LeagueImageVO {
    const newLeagueImage = new LeagueImageVO({ url, key });
    newLeagueImage.validate();
    return newLeagueImage;
  }

  private validate(): void {
    if (!this.props.url || !this.props.key) {
      throw new DomainException('MATCH_RECORD', 'Invalid League image data', HttpStatus.BAD_REQUEST);
    }
  }

  get url(): string {
    return this.props.url;
  }

  get key(): string {
    return this.props.key;
  }

  override toString(): string {
    return `LeagueImage(url: ${this.url}, key: ${this.key})`;
  }
}
