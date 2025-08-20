import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DrawModule } from '~/modules/draw/draw.module';
import { GiftFacadeImpl } from '~/modules/gift/application/facade/gift-facade';
import { GiftFacade } from '~/modules/gift/application/port/in/gift-facade.port';
import { GiftInvoker } from '~/modules/gift/application/port/in/gift-invoker.port';
import { GiftRepository } from '~/modules/gift/application/port/out/gift-repository.port';
import { GiftPersister } from '~/modules/gift/application/service/gift-persister';
import { GiftReader } from '~/modules/gift/application/service/gift-reader';
import { GiftEntity } from '~/modules/gift/infrastructure/repository/typeorm/entity/gift.entity';
import { TypeOrmGiftRepository } from '~/modules/gift/infrastructure/repository/typeorm/typeorm-gift-repository';
import { GiftController } from '~/modules/gift/presentation/http/gift.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GiftEntity]), DrawModule],
  controllers: [GiftController],
  providers: [
    GiftReader,
    GiftPersister,
    {
      provide: GiftRepository,
      useClass: TypeOrmGiftRepository,
    },
    {
      provide: GiftFacade,
      useClass: GiftFacadeImpl,
    },
    {
      provide: GiftInvoker,
      useExisting: GiftFacade,
    },
  ],
  exports: [GiftInvoker],
})
export class GiftModule {}
