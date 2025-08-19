import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheerFacadeImpl } from '~/modules/cheer/application/facade/cheer-facade';
import { CheerFacade } from '~/modules/cheer/application/port/in/cheer-facade.port';
import { CheerInvoker } from '~/modules/cheer/application/port/in/cheer-invoker.port';
import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { CheerPersister } from '~/modules/cheer/application/service/cheer-persister';
import { CheerReader } from '~/modules/cheer/application/service/cheer-reader';
import { CheerEntity } from '~/modules/cheer/infrastructure/repository/typeorm/entity/cheer.entity';
import { TypeOrmCheerRepository } from '~/modules/cheer/infrastructure/repository/typeorm/typeorm-cheer-repository';
import { CheerController } from '~/modules/cheer/presentation/http/cheer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheerEntity])],
  controllers: [CheerController],
  providers: [
    CheerReader,
    CheerPersister,
    {
      provide: CheerRepository,
      useClass: TypeOrmCheerRepository,
    },
    {
      provide: CheerFacade,
      useClass: CheerFacadeImpl,
    },
    {
      provide: CheerInvoker,
      useExisting: CheerFacade,
    },
  ],
  exports: [CheerInvoker],
})
export class CheerModule {}
