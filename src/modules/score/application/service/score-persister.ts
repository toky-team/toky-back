import { Injectable } from '@nestjs/common';

import { ScoreRepository } from '~/modules/score/application/port/out/score-repository.port';
import { Score } from '~/modules/score/domain/model/score';

@Injectable()
export class ScorePersister {
  constructor(private readonly scoreRepository: ScoreRepository) {}

  async save(score: Score): Promise<void> {
    await this.scoreRepository.save(score);
  }

  async saveAll(scores: Score[]): Promise<void> {
    await this.scoreRepository.saveAll(scores);
  }
}
