import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { ProfileVO } from '~/modules/player/domain/model/profile.vo';
import { ProfileImageVO } from '~/modules/player/domain/model/profile-image.vo';

export interface PlayerPrimitives {
  id: string;
  name: string;
  university: University;
  sport: Sport;
  department: string;
  birth: string;
  height: number;
  weight: number;
  position: string;
  backNumber: number;
  careers: string[];
  imageUrl: string;
  imageKey: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type PlayerDomainEvent = never;

export class Player extends AggregateRoot<PlayerPrimitives, PlayerDomainEvent> {
  private _name: string;
  private _university: University;
  private _sport: Sport;
  private _profile: ProfileVO;
  private _profileImage: ProfileImageVO;
  private _likeCount: number = 0;

  private constructor(
    id: string,
    name: string,
    university: University,
    sport: Sport,
    profile: ProfileVO,
    profileImage: ProfileImageVO,
    likeCount: number,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._name = name;
    this._university = university;
    this._sport = sport;
    this._profile = profile;
    this._profileImage = profileImage;
    this._likeCount = likeCount;
  }

  public static create(
    id: string,
    name: string,
    university: University,
    sport: Sport,
    department: string,
    birth: string,
    height: number,
    weight: number,
    position: string,
    backNumber: number,
    careers: string[],
    imageUrl: string,
    imageKey: string
  ): Player {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('PLAYER', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (!name || name.trim().length === 0) {
      throw new DomainException('PLAYER', '이름은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (name.trim().length > 50) {
      throw new DomainException('PLAYER', '이름은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const profile = ProfileVO.create(department, birth, height, weight, position, backNumber, careers);
    const profileImage = ProfileImageVO.create(imageUrl, imageKey);

    const player = new Player(id, name.trim(), university, sport, profile, profileImage, 0, now, now, null);

    return player;
  }

  public get name(): string {
    return this._name;
  }

  public get university(): University {
    return this._university;
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get profile(): ProfileVO {
    return this._profile;
  }

  public get profileImage(): ProfileImageVO {
    return this._profileImage;
  }

  public get likeCount(): number {
    return this._likeCount;
  }

  public changeName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException('PLAYER', '이름은 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    if (name.trim().length > 50) {
      throw new DomainException('PLAYER', '이름은 50자를 초과할 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    this._name = name.trim();
    this.touch();
  }

  public changeUniversity(university: University): void {
    this._university = university;
    this.touch();
  }

  public changeSport(sport: Sport): void {
    this._sport = sport;
    this.touch();
  }

  public changeProfile(
    department: string,
    birth: string,
    height: number,
    weight: number,
    position: string,
    backNumber: number,
    careers: string[]
  ): void {
    const newProfile = ProfileVO.create(department, birth, height, weight, position, backNumber, careers);
    this._profile = newProfile;
    this.touch();
  }

  public changeProfileImage(imageUrl: string, imageKey: string): void {
    const newProfileImage = ProfileImageVO.create(imageUrl, imageKey);
    this._profileImage = newProfileImage;
    this.touch();
  }

  public incrementLikeCount(count: number): void {
    this._likeCount += count;
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

  public toPrimitives(): PlayerPrimitives {
    return {
      id: this.id,
      name: this.name,
      university: this.university,
      sport: this.sport,
      department: this.profile.department,
      birth: this.profile.birth,
      height: this.profile.height,
      weight: this.profile.weight,
      position: this.profile.position,
      backNumber: this.profile.backNumber,
      careers: this.profile.careers,
      imageUrl: this.profileImage.url,
      imageKey: this.profileImage.key,
      likeCount: this.likeCount,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: PlayerPrimitives): Player {
    const profile = ProfileVO.create(
      primitives.department,
      primitives.birth,
      primitives.height,
      primitives.weight,
      primitives.position,
      primitives.backNumber,
      primitives.careers
    );
    const profileImage = ProfileImageVO.create(primitives.imageUrl, primitives.imageKey);

    return new Player(
      primitives.id,
      primitives.name,
      primitives.university,
      primitives.sport,
      profile,
      profileImage,
      primitives.likeCount,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null
    );
  }
}
