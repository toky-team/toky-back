import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

import { AppModule } from '~/app.module';
import { LogDirectoryUtil } from '~/libs/utils/log-directory.util';

const p = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (p) setGlobalDispatcher(new ProxyAgent(p));

async function bootstrap(): Promise<void> {
  // 로그 디렉토리 초기화
  LogDirectoryUtil.ensureLogDirectory();

  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TOKY API')
    .setDescription('API documentation for TOKY')
    .addCookieAuth('cookie-auth', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access-token',
    })
    .addSecurityRequirements('cookie-auth')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  const origins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: origins,
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
