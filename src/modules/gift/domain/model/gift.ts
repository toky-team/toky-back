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
  drawCount: number;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type GiftDomainEvent = never;

export class Gift extends AggregateRoot<GiftPrimitives, GiftDomainEvent> {
  private _name: string;
  private _alias: string;
  private _requiredTicket: number;
  private _giftImage: GiftImageVO;
  private _drawCount: number;

  private constructor(
    id: string,
    name: string,
    alias: string,
    requiredTicket: number,
    giftImage: GiftImageVO,
    drawCount: number,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._name = name;
    this._alias = alias;
    this._requiredTicket = requiredTicket;
    this._giftImage = giftImage;
    this._drawCount = drawCount;
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

    return new Gift(id, name.trim(), alias.trim(), requiredTicket, giftImage, 0, now, now, null);
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

  public get drawCount(): number {
    return this._drawCount;
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

  public incrementDrawCount(count: number = 1): void {
    if (count <= 0) {
      throw new DomainException('GIFT', '증가할 수는 0보다 커야 합니다', HttpStatus.BAD_REQUEST);
    }
    if (Number.isInteger(count) === false) {
      throw new DomainException('GIFT', '증가할 수는 정수여야 합니다', HttpStatus.BAD_REQUEST);
    }
    this._drawCount += count;
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
      name: this.name,
      alias: this.alias,
      requiredTicket: this.requiredTicket,
      imageUrl: this.giftImage.url,
      imageKey: this.giftImage.key,
      drawCount: this.drawCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: GiftPrimitives): Gift {
    const gift = new Gift(
      primitives.id,
      primitives.name,
      primitives.alias,
      primitives.requiredTicket,
      GiftImageVO.create(primitives.imageUrl, primitives.imageKey),
      primitives.drawCount,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt
    );

    return gift;
  }
}
