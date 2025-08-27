import { Injectable } from '@nestjs/common';

import { BetHitRepository } from '~/modules/bet-hit/application/port/out/bet-hit-repository.port';
import { BetHit } from '~/modules/bet-hit/domain/model/bet-hit';

@Injectable()
export class BetHitPersister {
  constructor(private readonly betHitRepository: BetHitRepository) {}

  async save(betHit: BetHit): Promise<void> {
    await this.betHitRepository.save(betHit);
  }

  async saveAll(betHits: BetHit[]): Promise<void> {
    await this.betHitRepository.saveAll(betHits);
  }
}
