import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthFacadeImpl } from '~/modules/auth/application/facade/auth-facade';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';
import { AuthInvoker } from '~/modules/auth/application/port/in/auth-invoker.port';
import { AuthRepository } from '~/modules/auth/application/port/out/auth-repository.port';
import { KakaoClient } from '~/modules/auth/application/port/out/kakao-client.port';
import { KopasClient } from '~/modules/auth/application/port/out/kopas-client.port';
import { AuthPersister } from '~/modules/auth/application/service/auth-persister';
import { AuthReader } from '~/modules/auth/application/service/auth-reader';
import { TokenService } from '~/modules/auth/application/service/token.service';
import { KakaoClientImpl } from '~/modules/auth/infrastructure/client/kakao-client.impl';
import { KopasClientImpl } from '~/modules/auth/infrastructure/client/kopas-client.impl';
import { AuthEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/auth.entity';
import { RefreshTokenEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/refresh-token.entity';
import { TypeOrmAuthRepository } from '~/modules/auth/infrastructure/repository/typeorm/typeorm-auth-repository';
import { AuthController } from '~/modules/auth/presentation/auth.controller';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity, RefreshTokenEntity]), JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [
    AuthReader,
    AuthPersister,
    TokenService,
    {
      provide: AuthRepository,
      useClass: TypeOrmAuthRepository,
    },
    {
      provide: KopasClient,
      useClass: KopasClientImpl,
    },
    {
      provide: KakaoClient,
      useClass: KakaoClientImpl,
    },
    {
      provide: AuthFacade,
      useClass: AuthFacadeImpl,
    },
    {
      provide: AuthInvoker,
      useExisting: AuthFacade,
    },
  ],
  exports: [AuthInvoker, JwtModule],
})
export class AuthModule {}
