import { Global, Module } from '@nestjs/common';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { UuidGenerator } from '~/modules/common/infrastructure/uuid-generator';

@Global()
@Module({
  providers: [
    {
      provide: IdGenerator,
      useClass: UuidGenerator,
    },
  ],
  exports: [IdGenerator],
})
export class CommonModule {}
