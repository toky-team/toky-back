import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerLikeFacadeImpl } from '~/modules/player-like/application/facade/player-like.facade';
import { PlayerLikeFacade } from '~/modules/player-like/application/port/in/player-like-facade.port';
import { PlayerLikeInvoker } from '~/modules/player-like/application/port/in/player-like-invoker.port';
import { PlayerLikeRepository } from '~/modules/player-like/application/port/out/player-like-repository.port';
import { PlayerLikePersister } from '~/modules/player-like/application/service/player-like-persister';
import { PlayerLikeReader } from '~/modules/player-like/application/service/player-like-reader';
import { PlayerLikeEntity } from '~/modules/player-like/infrastructure/repository/typeorm/entity/player-like.entity';
import { TypeOrmPlayerLikeRepository } from '~/modules/player-like/infrastructure/repository/typeorm/typeorm-player-like-repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerLikeEntity])],
  providers: [
    PlayerLikeReader,
    PlayerLikePersister,
    {
      provide: PlayerLikeRepository,
      useClass: TypeOrmPlayerLikeRepository,
    },
    {
      provide: PlayerLikeFacade,
      useClass: PlayerLikeFacadeImpl,
    },
    {
      provide: PlayerLikeInvoker,
      useExisting: PlayerLikeFacade,
    },
  ],
  exports: [PlayerLikeInvoker],
})
export class PlayerLikeModule {}
