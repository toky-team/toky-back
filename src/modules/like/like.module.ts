import { Module } from '@nestjs/common';

import { LikeFacadeImpl } from '~/modules/like/application/facade/like-facade';
import { LikeFacade } from '~/modules/like/application/port/in/like-facade.port';
import { likeInvoker } from '~/modules/like/application/port/in/like-invoker.port';
import { LikeRepository } from '~/modules/like/application/port/out/like-repository.port';
import { LikeInitializeService } from '~/modules/like/application/service/like-initialize.service';
import { LikePersister } from '~/modules/like/application/service/like-persister';
import { LikePubSubService } from '~/modules/like/application/service/like-pub-sub.service';
import { LikeReader } from '~/modules/like/application/service/like-reader';
import { RedisLikeRepository } from '~/modules/like/infrastructure/repository/redis/redis-like-repository';
import { LikeController } from '~/modules/like/presentation/http/like.controller';
import { LikeGateway } from '~/modules/like/presentation/socket/like-gateway';
import { LikeWsDocsController } from '~/modules/like/presentation/socket/ws-docs.controller';

@Module({
  imports: [],
  controllers: [LikeController, LikeWsDocsController],
  providers: [
    LikeGateway,

    LikeReader,
    LikePersister,
    LikePubSubService,
    LikeInitializeService,
    {
      provide: LikeRepository,
      useClass: RedisLikeRepository,
    },
    {
      provide: LikeFacade,
      useClass: LikeFacadeImpl,
    },
    {
      provide: likeInvoker,
      useExisting: LikeFacade,
    },
  ],
  exports: [likeInvoker],
})
export class LikeModule {}
