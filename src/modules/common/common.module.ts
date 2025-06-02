import { Global, Module } from '@nestjs/common';

import { CryptoUtil } from '~/modules/common/application/port/in/crypto.util';
import { IdGenerator } from '~/modules/common/application/port/in/id-generator.interface';
import { AesCryptoUtil } from '~/modules/common/infrastructure/aes-crypto.util';
import { UuidGenerator } from '~/modules/common/infrastructure/uuid-generator';

@Global()
@Module({
  providers: [
    {
      provide: IdGenerator,
      useClass: UuidGenerator,
    },
    {
      provide: CryptoUtil,
      useClass: AesCryptoUtil,
    },
  ],
  exports: [IdGenerator, CryptoUtil],
})
export class CommonModule {}
