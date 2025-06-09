import '~/configs/dayjs.config';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { TypeOrmConfig } from '~/configs/typeorm.config';
import { CommonModule } from '~/libs/common/common.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { ChatModule } from '~/modules/chat/chat.module';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(addTransactionalDataSource(new DataSource(options)));
      },
    }),

    CommonModule,
    UserModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
