import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserFacadeImpl } from '~/modules/user/application/facade/user-facade';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';
import { UserRepository } from '~/modules/user/application/port/out/user-repository.port';
import { UserPersister } from '~/modules/user/application/service/user-persister';
import { UserReader } from '~/modules/user/application/service/user-reader';
import { UserEntity } from '~/modules/user/infrastructure/repository/typeorm/entity/user.entity';
import { TypeOrmUserRepository } from '~/modules/user/infrastructure/repository/typeorm/typeorm-user-repository';
import { UserController } from '~/modules/user/presentation/http/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserReader,
    UserPersister,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: UserFacade,
      useClass: UserFacadeImpl,
    },
    {
      provide: UserInvoker,
      useExisting: UserFacade,
    },
  ],
  exports: [UserInvoker],
})
export class UserModule {}
