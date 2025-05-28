import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { TypeOrmConfig } from '~/configs/typeorm.config';
import { AuthModule } from '~/modules/auth/auth.module';
import { CommonModule } from '~/modules/common/common.module';
import { UserModule } from '~/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),

    CommonModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
