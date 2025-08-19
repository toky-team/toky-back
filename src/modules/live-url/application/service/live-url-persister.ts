import { Injectable } from '@nestjs/common';

import { LiveUrlRepository } from '~/modules/live-url/application/port/out/live-url-repository.port';
import { LiveUrl } from '~/modules/live-url/domain/model/live-url';

@Injectable()
export class LiveUrlPersister {
  constructor(private readonly liveUrlRepository: LiveUrlRepository) {}

  async save(liveUrl: LiveUrl): Promise<void> {
    await this.liveUrlRepository.save(liveUrl);
  }

  async saveAll(liveUrls: LiveUrl[]): Promise<void> {
    await this.liveUrlRepository.saveAll(liveUrls);
  }
}
