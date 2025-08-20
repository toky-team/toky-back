import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DrawFacadeImpl } from '~/modules/draw/application/facade/draw-facade';
import { DrawFacade } from '~/modules/draw/application/port/in/draw-facade.port';
import { DrawInvoker } from '~/modules/draw/application/port/in/draw-invoker.port';
import { DrawRepository } from '~/modules/draw/application/port/out/draw-repository.port';
import { DrawPersister } from '~/modules/draw/application/service/draw-persister';
import { DrawReader } from '~/modules/draw/application/service/draw-reader';
import { DrawEntity } from '~/modules/draw/infrastructure/repository/typeorm/entity/draw.entity';
import { TypeOrmDrawRepository } from '~/modules/draw/infrastructure/repository/typeorm/typeorm-draw-repository';

@Module({
  imports: [TypeOrmModule.forFeature([DrawEntity])],
  controllers: [],
  providers: [
    DrawReader,
    DrawPersister,
    {
      provide: DrawRepository,
      useClass: TypeOrmDrawRepository,
    },

    {
      provide: DrawFacade,
      useClass: DrawFacadeImpl,
    },
    {
      provide: DrawInvoker,
      useExisting: DrawFacade,
    },
  ],
  exports: [DrawInvoker],
})
export class DrawModule {}
