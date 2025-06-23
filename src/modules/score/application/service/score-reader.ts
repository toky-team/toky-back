import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { ScoreRepository } from '~/modules/score/application/port/out/score-repository.port';
import { Score } from '~/modules/score/domain/model/score';

@Injectable()
export class ScoreReader {
  constructor(private readonly scoreRepository: ScoreRepository) {}

  async findBySport(sport: Sport): Promise<Score | null> {
    return this.scoreRepository.findBySport(sport);
  }

  async findAll(): Promise<Score[]> {
    return this.scoreRepository.findAll();
  }
}
