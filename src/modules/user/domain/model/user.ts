import { AggregateRoot } from '~/libs/domain-core/aggregate-root';
import { UserCreatedEvent } from '~/modules/user/domain/events/user-created.event';
import { PhoneNumberVO } from '~/modules/user/domain/model/phone-number.vo';
import { UniversityVO } from '~/modules/user/domain/model/university.vo';

interface UserPrimitives {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  phoneNumber: string;
  university: string;
}

type UserDomainEvent = UserCreatedEvent;

export class User extends AggregateRoot<UserPrimitives, UserDomainEvent> {
  private _name: string;
  private _phoneNumber: PhoneNumberVO;
  private _university: UniversityVO;

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    name: string,
    phoneNumber: PhoneNumberVO,
    university: UniversityVO
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._name = name;
    this._phoneNumber = phoneNumber;
    this._university = university;
  }

  public static create(id: string, name: string, phoneNumber: string, university: string): User {
    const now = new Date();

    if (!id || id.trim().length === 0) {
      throw new Error('ID는 비어있을 수 없습니다');
    }

    this.validateName(name);

    const phoneNumberVO = PhoneNumberVO.create(phoneNumber);
    const universityVO = UniversityVO.create(university);

    const user = new User(id, now, now, null, name.trim(), phoneNumberVO, universityVO);

    user.addEvent(new UserCreatedEvent(user.id, user._name, user._phoneNumber.formatted, user._university.name, now));

    return user;
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('이름은 비어있을 수 없습니다');
    }

    if (name.trim().length > 50) {
      throw new Error('이름은 50자를 초과할 수 없습니다');
    }
  }

  public get name(): string {
    return this._name;
  }

  public get phoneNumber(): PhoneNumberVO {
    return this._phoneNumber;
  }

  public get university(): UniversityVO {
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

  public changeUniversity(university: string): void {
    const universityVO = UniversityVO.create(university);
    this._university = universityVO;
    this.touch();
  }

  public delete(): void {
    if (this.isDeleted()) {
      throw new Error('이미 삭제된 사용자입니다');
    }

    this.deletedAt = new Date();
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
      university: this._university.name,
    };
  }

  public static reconstruct(primitives: UserPrimitives): User {
    const phoneNumberVO = PhoneNumberVO.create(primitives.phoneNumber);
    const universityVO = UniversityVO.create(primitives.university);

    return new User(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.name,
      phoneNumberVO,
      universityVO
    );
  }
}
