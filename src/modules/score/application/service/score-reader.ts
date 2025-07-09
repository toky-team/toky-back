import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { EntireScore } from '~/modules/score/application/dto/entire-score.dto';
import { ScoreRepository } from '~/modules/score/application/port/out/score-repository.port';
import { Score } from '~/modules/score/domain/model/score';

@Injectable()
export class ScoreReader {
  constructor(private readonly scoreRepository: ScoreRepository) {}

  async findBySport(sport: Sport): Promise<Score | null> {
    return this.scoreRepository.findBySport(sport);
  }

  /**
   * 전체 점수를 조회합니다.
   * KUScore와 YUScore를 각각 계산하여 반환합니다.
   * @return {EntireScore} KUScore와 YUScore를 포함하는 객체
   * */
  async findEntireScore(): Promise<EntireScore> {
    const sports = Object.values(Sport);
    let KUScore = 0;
    let YUScore = 0;
    for (const sport of sports) {
      const score = await this.scoreRepository.findBySport(sport);
      if (score && score.matchStatus.isCompleted()) {
        if (score.KUScore > score.YUScore) {
          KUScore += 1;
        } else if (score.KUScore < score.YUScore) {
          YUScore += 1;
        }
      }
    }

    return { KUScore, YUScore };
  }

  async findAll(): Promise<Score[]> {
    return this.scoreRepository.findAll();
  }
}
