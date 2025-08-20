import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { GiftImageVO } from '~/modules/gift/domain/model/gift-image.vo';

export interface GiftPrimitives {
  id: string;
  name: string;
  alias: string;
  requiredTicket: number;
  imageUrl: string;
  imageKey: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type GiftDomainEvent = never;

export class Gift extends AggregateRoot<GiftPrimitives, GiftDomainEvent> {
  private _name: string;
  private _alias: string;
  private _requiredTicket: number;
  private _giftImage: GiftImageVO;

  private constructor(
    id: string,
    name: string,
    alias: string,
    requiredTicket: number,
    giftImage: GiftImageVO,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._name = name;
    this._alias = alias;
    this._requiredTicket = requiredTicket;
    this._giftImage = giftImage;
  }

  public static create(
    id: string,
    name: string,
    alias: string,
    requiredTicket: number,
    imageUrl: string,
    imageKey: string
  ): Gift {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('GIFT', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!name || name.trim().length === 0) {
      throw new DomainException('GIFT', '이름은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (name.trim().length > 50) {
      throw new DomainException('GIFT', '이름은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!alias || alias.trim().length === 0) {
      throw new DomainException('GIFT', '별칭은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }
    if (alias.trim().length > 50) {
      throw new DomainException('GIFT', '별칭은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (requiredTicket <= 0) {
      throw new DomainException('GIFT', '필수 티켓 수는 0보다 커야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (Number.isInteger(requiredTicket) === false) {
      throw new DomainException('GIFT', '필수 티켓 수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    const giftImage = GiftImageVO.create(imageUrl, imageKey);

    return new Gift(id, name.trim(), alias.trim(), requiredTicket, giftImage, now, now, null);
  }

  public get name(): string {
    return this._name;
  }

  public get alias(): string {
    return this._alias;
  }

  public get requiredTicket(): number {
    return this._requiredTicket;
  }

  public get giftImage(): GiftImageVO {
    return this._giftImage;
  }

  public changeName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException('GIFT', '이름은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (name.trim().length > 50) {
      throw new DomainException('GIFT', '이름은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this._name = name.trim();
    this.touch();
  }

  public changeAlias(alias: string): void {
    if (!alias || alias.trim().length === 0) {
      throw new DomainException('GIFT', '별칭은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (alias.trim().length > 50) {
      throw new DomainException('GIFT', '별칭은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this._alias = alias.trim();
    this.touch();
  }

  public changeRequiredTicket(requiredTicket: number): void {
    if (requiredTicket <= 0) {
      throw new DomainException('GIFT', '필수 티켓 수는 0보다 커야 합니다', HttpStatus.BAD_REQUEST);
    }

    if (Number.isInteger(requiredTicket) === false) {
      throw new DomainException('GIFT', '필수 티켓 수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }

    this._requiredTicket = requiredTicket;
    this.touch();
  }

  public changeGiftImage(imageUrl: string, imageKey: string): void {
    const newGiftImage = GiftImageVO.create(imageUrl, imageKey);
    this._giftImage = newGiftImage;
    this.touch();
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public restore(): void {
    this.deletedAt = null;
    this.touch();
  }

  public toPrimitives(): GiftPrimitives {
    return {
      id: this.id,
      name: this._name,
      alias: this._alias,
      requiredTicket: this._requiredTicket,
      imageUrl: this._giftImage.url,
      imageKey: this._giftImage.key,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: GiftPrimitives): Gift {
    const gift = new Gift(
      primitives.id,
      primitives.name,
      primitives.alias,
      primitives.requiredTicket,
      GiftImageVO.create(primitives.imageUrl, primitives.imageKey),
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );

    return gift;
  }
}
