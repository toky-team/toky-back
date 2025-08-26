import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerDailyLikeFacadeImpl } from '~/modules/player-daily-like/application/facade/player-daily-like-facade';
import { PlayerDailyLikeFacade } from '~/modules/player-daily-like/application/port/in/player-daily-like-facade.port';
import { PlayerDailyLikeInvoker } from '~/modules/player-daily-like/application/port/in/player-daily-like-invoker.port';
import { PlayerDailyLikeRepository } from '~/modules/player-daily-like/application/port/out/player-daily-like-repository.port';
import { PlayerDailyLikePersister } from '~/modules/player-daily-like/application/service/player-daily-like-persister';
import { PlayerDailyLikeReader } from '~/modules/player-daily-like/application/service/player-daily-like-reader';
import { PlayerDailyLikeEntity } from '~/modules/player-daily-like/infrastructure/repository/typeorm/entity/player-daily-like.entity';
import { TypeOrmPlayerDailyLikeRepository } from '~/modules/player-daily-like/infrastructure/repository/typeorm/typeorm-player-daily-like-repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerDailyLikeEntity])],
  controllers: [],
  providers: [
    PlayerDailyLikeReader,
    PlayerDailyLikePersister,
    {
      provide: PlayerDailyLikeRepository,
      useClass: TypeOrmPlayerDailyLikeRepository,
    },
    {
      provide: PlayerDailyLikeFacade,
      useClass: PlayerDailyLikeFacadeImpl,
    },
    {
      provide: PlayerDailyLikeInvoker,
      useExisting: PlayerDailyLikeFacade,
    },
  ],
  exports: [PlayerDailyLikeInvoker],
})
export class PlayerDailyLikeModule {}
