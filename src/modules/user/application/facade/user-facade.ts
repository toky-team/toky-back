import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { University } from '~/libs/enums/university';
import { TicketInvoker } from '~/modules/ticket/application/port/in/ticket-invoker.port';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserPersister } from '~/modules/user/application/service/user-persister';
import { UserReader } from '~/modules/user/application/service/user-reader';
import { User, UserPrimitives } from '~/modules/user/domain/model/user';

@Injectable()
export class UserFacadeImpl extends UserFacade {
  constructor(
    private readonly userReader: UserReader,
    private readonly userPersister: UserPersister,

    private readonly idGenerator: IdGenerator,
    private readonly configService: ConfigService,
    private readonly ticketInvoker: TicketInvoker
  ) {
    super();
  }

  @Transactional()
  async createUser(name: string, phoneNumber: string, university: University): Promise<UserPrimitives> {
    if (await this.userReader.existsByPhoneNumber(phoneNumber)) {
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

  async isAdmin(id: string): Promise<boolean> {
    const user = await this.userReader.findById(id);
    if (user === null) {
      throw new DomainException('USER', `해당 ID의 사용자를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
    }
    const adminIds = this.configService.get<string>('ADMIN_USER_IDS')?.split(',') || [];
    return adminIds.includes(user.id);
  }
}
