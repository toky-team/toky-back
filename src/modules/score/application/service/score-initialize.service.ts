import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { ScoreRepository } from '~/modules/score/application/port/out/score-repository.port';
import { Score } from '~/modules/score/domain/model/score';

@Injectable()
export class ScoreInitializeService implements OnApplicationBootstrap {
  constructor(private readonly scoreRepository: ScoreRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.initializeScores();
  }

  async initializeScores(): Promise<void> {
    const sports = Object.values(Sport);
    for (const sport of sports) {
      const score = await this.scoreRepository.findBySport(sport);
      if (score === null) {
        const newScore = Score.create(sport);
        await this.scoreRepository.save(newScore);
      }
    }
  }
}
