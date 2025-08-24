import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { UsersSummaryDto } from '~/modules/user/application/dto/users-summary.dto';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserPersister } from '~/modules/user/application/service/user-persister';
import { UserReader } from '~/modules/user/application/service/user-reader';
import { PhoneNumberVO } from '~/modules/user/domain/model/phone-number.vo';
import { User, UserPrimitives } from '~/modules/user/domain/model/user';

@Injectable()
export class UserFacadeImpl extends UserFacade {
  private logger = new Logger(UserFacadeImpl.name);

  constructor(
    private readonly userReader: UserReader,
    private readonly userPersister: UserPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async createUser(
    name: string,
    phoneNumber: string,
    university: University,
    inviteCode?: string
  ): Promise<UserPrimitives> {
    if (await this.getNameExists(name)) {
      throw new DomainException('USER', `해당 이름의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }
    if (await this.getPhoneNumberExists(phoneNumber)) {
      throw new DomainException('USER', `해당 전화번호의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }

    const invitedBy = inviteCode ? await this.userReader.findUserIdByInviteCode(inviteCode) : undefined;
    if (invitedBy === null) {
      this.logger.warn(`초대 코드가 유효하지 않습니다: ${inviteCode}`);
    }

    const user = User.create(this.idGenerator.generateId(), name, phoneNumber, university, invitedBy ?? undefined);
    await this.userPersister.save(user);
    return user.toPrimitives();
  }

  @Transactional()
  async updateUser(id: string, name?: string, phoneNumber?: string, university?: University): Promise<UserPrimitives> {
    const user = await this.userReader.findById(id);
    if (user === null) {
      throw new DomainException('USER', `해당 ID의 사용자를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }

    if (name !== undefined) {
      if (await this.getNameExists(name)) {
        throw new DomainException('USER', `해당 이름의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
      }
      user.changeName(name);
    }

    if (phoneNumber !== undefined) {
      if (await this.getPhoneNumberExists(phoneNumber)) {
        throw new DomainException('USER', `해당 전화번호의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
      }
      user.changePhoneNumber(phoneNumber);
    }

    if (university !== undefined) {
      user.changeUniversity(university);
    }

    await this.userPersister.save(user);
    return user.toPrimitives();
  }

  async getUserById(id: string): Promise<UserPrimitives> {
    const user = await this.userReader.findById(id);
    if (user === null) {
      throw new DomainException('USER', `해당 ID의 사용자를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    return user.toPrimitives();
  }

  @Transactional()
  async getInviteCode(id: string): Promise<string> {
    const user = await this.userReader.findById(id);
    if (user === null) {
      throw new DomainException('USER', `해당 ID의 사용자를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    if (user.inviteCode === null) {
      user.generateInviteCode();
      if (!user.inviteCode) {
        throw new DomainException('USER', '초대 코드 생성에 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      await this.userPersister.save(user);
    }

    return user.inviteCode;
  }

  async getNameExists(name: string): Promise<boolean> {
    return this.userReader.existsByName(name);
  }

  async getPhoneNumberExists(phoneNumber: string): Promise<boolean> {
    // 유효성 검증 및 포매팅
    const phoneNumberVo = PhoneNumberVO.create(phoneNumber);
    return this.userReader.existsByPhoneNumber(phoneNumberVo.formatted);
  }

  async getUsersSummary(): Promise<UsersSummaryDto> {
    const users = await this.userReader.findMany({});
    const totalUsers = users.length;
    const KUUsers = users.filter((user) => user.university === University.KOREA_UNIVERSITY).length;
    const YUUsers = users.filter((user) => user.university === University.YONSEI_UNIVERSITY).length;

    const now = DateUtil.now();

    const todayNewUsers = users.filter((user) => user.createdAt.isSame(now, 'date')).length;
    const thisWeekNewUsers = users.filter((user) => user.createdAt.isSame(now, 'week')).length;
    const thisMonthNewUsers = users.filter((user) => user.createdAt.isSame(now, 'month')).length;

    return {
      totalUsers,
      KUUsers,
      YUUsers,
      newUsers: {
        today: todayNewUsers,
        thisWeek: thisWeekNewUsers,
        thisMonth: thisMonthNewUsers,
      },
    };
  }
}
