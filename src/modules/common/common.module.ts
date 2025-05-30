import { Global, Module } from '@nestjs/common';

import { IdGenerator } from '~/libs/domain-core/id-generator.interface';
import { CryptoUtil } from '~/libs/utils/crypto.util';
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
