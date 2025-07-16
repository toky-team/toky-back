import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { RedisConfig } from '~/configs/redis.config';
import { AesCryptoUtil } from '~/libs/common/cryptos/aes-crypto.util';
import { CryptoUtil } from '~/libs/common/cryptos/crypto.util';
import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { RedisEventBus } from '~/libs/common/event-bus/redis-event-bus';
import { GlobalExceptionFilter } from '~/libs/common/filters/global-exception.filter';
import { WsExceptionFilter } from '~/libs/common/filters/ws-exception.filter';
import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { UuidGenerator } from '~/libs/common/id/uuid-generator';
import { GlobalLoggingInterceptor } from '~/libs/common/interceptors/global-logging.interceptor';
import { WSLoggingInterceptor } from '~/libs/common/interceptors/ws-logging.interceptor';
import { GlobalValidationPipe } from '~/libs/common/pipes/global-validation.pipe';
import { PubSubClient } from '~/libs/common/pub-sub/pub-sub.client';
import { RedisPubSubClient } from '~/libs/common/pub-sub/redis-pub-sub.client';
import { AligoSmsClient } from '~/libs/common/sms/aligo-sms.client';
import { SmsClient } from '~/libs/common/sms/sms.client';
import { AuthModule } from '~/modules/auth/auth.module';
import { JwtAuthGuard } from '~/modules/auth/presentation/http/guard/jwt-auth.guard';

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
    RedisConfig,
    {
      provide: PubSubClient,
      useClass: RedisPubSubClient,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    WsExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalLoggingInterceptor,
    },
    WSLoggingInterceptor,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_PIPE,
      useValue: GlobalValidationPipe,
    },
    {
      provide: EventBus,
      useClass: RedisEventBus,
    },
    {
      provide: SmsClient,
      useClass: AligoSmsClient,
    },
  ],
  exports: [
    IdGenerator,
    CryptoUtil,
    RedisConfig,
    PubSubClient,
    WsExceptionFilter,
    WSLoggingInterceptor,
    EventBus,
    SmsClient,
  ],
})
export class CommonModule {}
