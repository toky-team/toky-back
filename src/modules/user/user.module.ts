import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserFacadeImpl } from '~/modules/user/application/facade/user-facade.impl';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';
import { UserPersister } from '~/modules/user/application/port/in/user-persister.port';
import { UserReader } from '~/modules/user/application/port/in/user-reader.port';
import { UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { UserInvokerImpl } from '~/modules/user/application/service/user-invoker.impl';
import { UserPersisterImpl } from '~/modules/user/application/service/user-persister.impl';
import { UserReaderImpl } from '~/modules/user/application/service/user-reader.impl';
import { UserEntity } from '~/modules/user/infrastructure/repository/typeorm/entity/user.entity';
import { TypeOrmUserRepository } from '~/modules/user/infrastructure/repository/typeorm/typeorm-user-repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [],
  providers: [
    {
      provide: UserReader,
      useClass: UserReaderImpl,
    },
    {
      provide: UserPersister,
      useClass: UserPersisterImpl,
    },
    {
      provide: UserInvoker,
      useClass: UserInvokerImpl,
    },
    {
      provide: UserFacade,
      useClass: UserFacadeImpl,
    },
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [UserReader, UserInvoker],
})
export class UserModule {}
