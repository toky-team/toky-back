import { Module } from '@nestjs/common';

import { CheerFacadeImpl } from '~/modules/cheer/application/facade/cheer-facade';
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { cheerInvoker } from '~/modules/cheer/application/port/in/cheer-invoker.port';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { CheerInitializeService } from '~/modules/cheer/application/service/cheer-initialize.service';
import { CheerPersister } from '~/modules/cheer/application/service/cheer-persister';
import { CheerPubSubService } from '~/modules/cheer/application/service/cheer-pub-sub.service';
import { CheerReader } from '~/modules/cheer/application/service/cheer-reader';
import { RedisCheerRepository } from '~/modules/cheer/infrastructure/repository/redis/redis-cheer-repository';
import { CheerController } from '~/modules/cheer/presentation/http/cheer.controller';
import { CheerGateway } from '~/modules/cheer/presentation/socket/cheer-gateway';
import { CheerWsDocsController } from '~/modules/cheer/presentation/socket/ws-docs.controller';

@Module({
  imports: [],
  controllers: [CheerController, CheerWsDocsController],
  providers: [
    CheerGateway,

    CheerReader,
    CheerPersister,
    CheerPubSubService,
    CheerInitializeService,
    {
      provide: CheerRepository,
      useClass: RedisCheerRepository,
    },
    {
      provide: CheerFacade,
      useClass: CheerFacadeImpl,
    },
    {
      provide: cheerInvoker,
      useExisting: CheerFacade,
    },
  ],
  exports: [cheerInvoker],
})
export class CheerModule {}
