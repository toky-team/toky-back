import { Injectable } from '@nestjs/common';

import { CheerRepository } from '~/modules/cheer/application/port/out/cheer-repository.port';
import { Cheer } from '~/modules/cheer/domain/model/cheer';

@Injectable()
export class CheerPersister {
  constructor(private readonly cheerRepository: CheerRepository) {}

  async save(cheer: Cheer): Promise<void> {
    await this.cheerRepository.save(cheer);
  }

  async saveAll(cheers: Cheer[]): Promise<void> {
    await this.cheerRepository.saveAll(cheers);
  }
}
