import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthFacadeImpl } from '~/modules/auth/application/facade/auth-facade.impl';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthInvoker } from '~/modules/auth/application/port/in/auth-invoker.port';
import { AuthPersister } from '~/modules/auth/application/port/in/auth-persister.port';
import { AuthReader } from '~/modules/auth/application/port/in/auth-reader.port';
import { AuthRepository } from '~/modules/auth/application/port/out/auth-repository.port';
import { KopasClient } from '~/modules/auth/application/port/out/kopas-client.port';
import { AuthInvokerImpl } from '~/modules/auth/application/service/auth-invoker.impl';
import { AuthPersisterImpl } from '~/modules/auth/application/service/auth-persister.impl';
import { AuthReaderImpl } from '~/modules/auth/application/service/auth-reader.impl';
import { TokenService } from '~/modules/auth/application/service/token.service';
import { KopasClientImpl } from '~/modules/auth/infrastructure/client/kopas-client.impl';
import { AuthEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/auth.entity';
import { TypeOrmAuthRepository } from '~/modules/auth/infrastructure/repository/typeorm/typeorm-auth-repository';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity]), JwtModule.register({})],
  controllers: [],
  providers: [
    {
      provide: AuthReader,
      useClass: AuthReaderImpl,
    },
    {
      provide: AuthPersister,
      useClass: AuthPersisterImpl,
    },
    {
      provide: AuthInvoker,
      useClass: AuthInvokerImpl,
    },
    {
      provide: AuthFacade,
      useClass: AuthFacadeImpl,
    },
    {
      provide: AuthRepository,
      useClass: TypeOrmAuthRepository,
    },
    TokenService,
    {
      provide: KopasClient,
      useClass: KopasClientImpl,
    },
  ],
  exports: [AuthReader, AuthInvoker],
})
export class AuthModule {}
