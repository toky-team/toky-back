import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShareFacadeImpl } from '~/modules/share/application/facade/share-facade';
import { ShareFacade } from '~/modules/share/application/port/in/share-facade.port';
import { ShareInvoker } from '~/modules/share/application/port/in/share-invoker.port';
import { ShareRepository } from '~/modules/share/application/port/out/share-repository.port';
import { SharePersister } from '~/modules/share/application/service/share.persister';
import { ShareReader } from '~/modules/share/application/service/share.reader';
import { ShareEntity } from '~/modules/share/infrastructure/repository/typeorm/entity/share.entity';
import { TypeOrmShareRepository } from '~/modules/share/infrastructure/repository/typeorm/typeorm-share-repository';

@Module({
  imports: [TypeOrmModule.forFeature([ShareEntity])],
  controllers: [],
  providers: [
    ShareReader,
    SharePersister,
    {
      provide: ShareRepository,
      useClass: TypeOrmShareRepository,
    },
    {
      provide: ShareFacade,
      useClass: ShareFacadeImpl,
    },
    {
      provide: ShareInvoker,
      useExisting: ShareFacade,
    },
  ],
  exports: [ShareInvoker],
})
export class ShareModule {}
