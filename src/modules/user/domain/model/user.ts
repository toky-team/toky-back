import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { UserCreatedEvent } from '~/modules/user/domain/events/user-created.event';
import { PhoneNumberVO } from '~/modules/user/domain/model/phone-number.vo';

export interface UserPrimitives {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  phoneNumber: string;
  university: University;
}

type UserDomainEvent = UserCreatedEvent;

export class User extends AggregateRoot<UserPrimitives, UserDomainEvent> {
  private _name: string;
  private _phoneNumber: PhoneNumberVO;
  private _university: University;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    name: string,
    phoneNumber: PhoneNumberVO,
    university: University
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._name = name;
    this._phoneNumber = phoneNumber;
    this._university = university;
  }

  public static create(id: string, name: string, phoneNumber: string, university: University): User {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('USER', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this.validateName(name);

    const phoneNumberVO = PhoneNumberVO.create(phoneNumber);

    const user = new User(id, now, now, null, name.trim(), phoneNumberVO, university);

    user.addEvent(new UserCreatedEvent(user.id, user.id, user.name, user.phoneNumber.formatted, user.university, now));

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
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
      name: this._name,
      phoneNumber: this._phoneNumber.formatted,
      university: this._university,
    };
  }

  public static reconstruct(primitives: UserPrimitives): User {
    const phoneNumberVO = PhoneNumberVO.create(primitives.phoneNumber);

    return new User(
      primitives.id,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null,
      primitives.name,
      phoneNumberVO,
      primitives.university
    );
  }
}
