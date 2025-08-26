import { HttpStatus } from '@nestjs/common';
import { createHash } from 'crypto';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { UserCreatedEvent } from '~/modules/user/domain/events/user-created.event';
import { UserInvitedEvent } from '~/modules/user/domain/events/user-invited.event';
import { PhoneNumberVO } from '~/modules/user/domain/model/phone-number.vo';

export interface UserPrimitives {
  id: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
  name: string;
  phoneNumber: string;
  university: University;
  inviteCode: string | null;
}

type UserDomainEvent = UserCreatedEvent | UserInvitedEvent;

export class User extends AggregateRoot<UserPrimitives, UserDomainEvent> {
  private _name: string;
  private _phoneNumber: PhoneNumberVO;
  private _university: University;
  private _inviteCode: string | null;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    name: string,
    phoneNumber: PhoneNumberVO,
    university: University,
    inviteCode: string | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._name = name;
    this._phoneNumber = phoneNumber;
    this._university = university;
    this._inviteCode = inviteCode;
  }

  private static generateInviteCode(userId: string): string {
    const hash = createHash('sha256').update(userId).digest('hex');

    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let result = '';
    let num = parseInt(hash.substring(0, 8), 16); // 8자리 16진수 사용

    for (let i = 0; i < 6; i++) {
      result += chars[num % chars.length];
      num = Math.floor(num / chars.length);
    }

    return result;
  }

  public static create(
    id: string,
    name: string,
    phoneNumber: string,
    university: University,
    invitedBy?: string
  ): User {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('USER', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this.validateName(name);

    const phoneNumberVO = PhoneNumberVO.create(phoneNumber);

    const user = new User(id, now, now, null, name.trim(), phoneNumberVO, university, null);

    user.addEvent(new UserCreatedEvent(user.id, user.id, user.name, user.phoneNumber.formatted, user.university, now));
    if (invitedBy !== undefined) {
      user.addEvent(new UserInvitedEvent(user.id, user.id, invitedBy, now));
    }

    return user;
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException('USER', '이름은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (name.trim().length > 50) {
      throw new DomainException('USER', '이름은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }
  }

  public get name(): string {
    return this._name;
  }

  public get phoneNumber(): PhoneNumberVO {
    return this._phoneNumber;
  }

  public get university(): University {
    return this._university;
  }

  public get inviteCode(): string | null {
    return this._inviteCode;
  }

  public changeName(name: string): void {
    User.validateName(name);
    this._name = name.trim();
    this.touch();
  }

  public changePhoneNumber(phoneNumber: string): void {
    const phoneNumberVO = PhoneNumberVO.create(phoneNumber);
    this._phoneNumber = phoneNumberVO;
    this.touch();
  }

  public changeUniversity(university: University): void {
    this._university = university;
    this.touch();
  }

  public generateInviteCode(): void {
    this._inviteCode = User.generateInviteCode(this.id);
    this.touch();
  }

  public delete(): void {
    if (this.isDeleted()) {
      throw new DomainException('USER', '이미 삭제된 사용자입니다', HttpStatus.BAD_REQUEST);
    }

    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public toPrimitives(): UserPrimitives {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      name: this._name,
      phoneNumber: this._phoneNumber.formatted,
      university: this._university,
      inviteCode: this._inviteCode,
    };
  }

  public static reconstruct(primitives: UserPrimitives): User {
    const phoneNumberVO = PhoneNumberVO.create(primitives.phoneNumber);

    return new User(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.name,
      phoneNumberVO,
      primitives.university,
      primitives.inviteCode
    );
  }
}
