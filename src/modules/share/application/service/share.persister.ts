import { Injectable } from '@nestjs/common';

import { ShareRepository } from '~/modules/share/application/port/out/share-repository.port';
import { Share } from '~/modules/share/domain/model/share';

@Injectable()
export class SharePersister {
  constructor(private readonly shareRepository: ShareRepository) {}

  async save(share: Share): Promise<void> {
    await this.shareRepository.save(share);
  }

  async saveAll(shares: Share[]): Promise<void> {
    await this.shareRepository.saveAll(shares);
  }
}
