import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LiveUrlFacadeImpl } from '~/modules/live-url/application/facade/live-url-facade';
import { LiveUrlFacade } from '~/modules/live-url/application/port/in/live-url-facade.port';
import { LiveUrlInvoker } from '~/modules/live-url/application/port/in/live-url-invoker.port';
import { LiveUrlRepository } from '~/modules/live-url/application/port/out/live-url-repository.port';
import { LiveUrlPersister } from '~/modules/live-url/application/service/live-url-persister';
import { LiveUrlReader } from '~/modules/live-url/application/service/live-url-reader';
import { LiveUrlEntity } from '~/modules/live-url/infrastructure/repository/typeorm/entity/live-url.entity';
import { TypeOrmLiveUrlRepository } from '~/modules/live-url/infrastructure/repository/typeorm/typeorm-live-url-repository';
import { LiveUrlController } from '~/modules/live-url/presentation/http/live-url.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiveUrlEntity])],
  controllers: [LiveUrlController],
  providers: [
    LiveUrlReader,
    LiveUrlPersister,
    {
      provide: LiveUrlRepository,
      useClass: TypeOrmLiveUrlRepository,
    },
    {
      provide: LiveUrlFacade,
      useClass: LiveUrlFacadeImpl,
    },
    {
      provide: LiveUrlInvoker,
      useExisting: LiveUrlFacade,
    },
  ],
  exports: [LiveUrlInvoker],
})
export class LiveUrlModule {}
