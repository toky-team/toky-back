import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerFacadeImpl } from '~/modules/player/application/facade/player-facade';
import { PlayerFacade } from '~/modules/player/application/port/in/player-facade.port';
import { PlayerInvoker } from '~/modules/player/application/port/in/player-invoker.port';
import { PlayerRepository } from '~/modules/player/application/port/out/player-repository.port';
import { PlayerPersister } from '~/modules/player/application/service/player-persister';
import { PlayerReader } from '~/modules/player/application/service/player-reader';
import { PlayerEntity } from '~/modules/player/infrastructure/repository/typeorm/entity/player.entity';
import { TypeOrmPlayerRepository } from '~/modules/player/infrastructure/repository/typeorm/typeorm-player-repository';
import { PlayerController } from '~/modules/player/presentation/http/player.controller';
import { PlayerDailyLikeModule } from '~/modules/player-daily-like/player-daily-like.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerEntity]), PlayerDailyLikeModule],
  controllers: [PlayerController],
  providers: [
    PlayerReader,
    PlayerPersister,
    {
      provide: PlayerRepository,
      useClass: TypeOrmPlayerRepository,
    },
    {
      provide: PlayerFacade,
      useClass: PlayerFacadeImpl,
    },
    {
      provide: PlayerInvoker,
      useExisting: PlayerFacade,
    },
  ],
  exports: [PlayerInvoker],
})
export class PlayerModule {}
