import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AesCryptoUtil } from '~/libs/common/cryptos/aes-crypto.util';
import { CryptoUtil } from '~/libs/common/cryptos/crypto.util';
import { GlobalExceptionFilter } from '~/libs/common/filters/global-exception.filter';
import { JwtAuthGuard } from '~/libs/common/guards/jwt-auth.guard';
import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { UuidGenerator } from '~/libs/common/id/uuid-generator';
import { LoggingInterceptor } from '~/libs/common/interceptors/logging.interceptor';
import { GlobalValidationPipe } from '~/libs/common/pipes/global-validation.pipe';
import { AuthModule } from '~/modules/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: IdGenerator,
      useClass: UuidGenerator,
    },
    {
      provide: CryptoUtil,
      useClass: AesCryptoUtil,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_PIPE,
      useValue: GlobalValidationPipe,
    },
  ],
  exports: [IdGenerator, CryptoUtil],
})
export class CommonModule {}
