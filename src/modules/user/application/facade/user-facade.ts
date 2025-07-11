import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { TicketInvoker } from '~/modules/ticket/application/port/in/ticket-invoker.port';
import { UsersSummaryDto } from '~/modules/user/application/dto/users-summary.dto';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserPersister } from '~/modules/user/application/service/user-persister';
import { UserReader } from '~/modules/user/application/service/user-reader';
import { PhoneNumberVO } from '~/modules/user/domain/model/phone-number.vo';
import { User, UserPrimitives } from '~/modules/user/domain/model/user';

@Injectable()
export class UserFacadeImpl extends UserFacade {
  constructor(
    private readonly userReader: UserReader,
    private readonly userPersister: UserPersister,

    private readonly idGenerator: IdGenerator,
    private readonly ticketInvoker: TicketInvoker
  ) {
    super();
  }

  @Transactional()
  async createUser(name: string, phoneNumber: string, university: University): Promise<UserPrimitives> {
    if (await this.getNameExists(name)) {
      throw new DomainException('USER', `해당 이름의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }
    if (await this.getPhoneNumberExists(phoneNumber)) {
      throw new DomainException('USER', `해당 전화번호의 사용자가 이미 존재합니다.`, HttpStatus.BAD_REQUEST);
    }

    const user = User.create(this.idGenerator.generateId(), name, phoneNumber, university);
    await this.userPersister.save(user);
    await this.ticketInvoker.initializeTicketCount(user.id);
    return user.toPrimitives();
  }

  async getUserById(id: string): Promise<UserPrimitives> {
    const user = await this.userReader.findById(id);
    if (user === null) {
      throw new DomainException('USER', `해당 ID의 사용자를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    return user.toPrimitives();
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

    const todayNewUsers = users.filter((user) => user.createdAt.isSame(DateUtil.now(), 'day')).length;
    const thisWeekNewUsers = users.filter((user) => user.createdAt.isSame(DateUtil.now(), 'week')).length;
    const thisMonthNewUsers = users.filter((user) => user.createdAt.isSame(DateUtil.now(), 'month')).length;

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
