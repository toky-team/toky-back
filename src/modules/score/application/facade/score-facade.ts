import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { ScoreFacade } from '~/modules/score/application/port/in/score-facade.port';
import { ScorePersister } from '~/modules/score/application/service/score-persister';
import { ScorePubSubService } from '~/modules/score/application/service/score-pub-sub.service';
import { ScoreReader } from '~/modules/score/application/service/score-reader';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

@Injectable()
export class ScoreFacadeImpl extends ScoreFacade {
  constructor(
    private readonly scoreReader: ScoreReader,
    private readonly scorePersister: ScorePersister,
    private readonly scorePubSubService: ScorePubSubService
  ) {
    super();
  }

  @Transactional()
  async startGame(sport: Sport): Promise<void> {
    const score = await this.scoreReader.findBySport(sport);
    if (!score) {
      throw new DomainException('SCORE', '경기 데이터를 찾을 수 없습니다.');
    }

    score.activate();
    await this.scorePersister.save(score);

    await this.scorePubSubService.publishScore(score.toPrimitives());
  }

  @Transactional()
  async endGame(sport: Sport): Promise<void> {
    const score = await this.scoreReader.findBySport(sport);
    if (!score) {
      throw new DomainException('SCORE', '경기 데이터를 찾을 수 없습니다.');
    }

    score.deactivate();
    await this.scorePersister.save(score);

    await this.scorePubSubService.publishScore(score.toPrimitives());
  }

  @Transactional()
  async updateScore(sport: Sport, kuScore: number, yuScore: number): Promise<void> {
    const score = await this.scoreReader.findBySport(sport);
    if (!score) {
      throw new DomainException('SCORE', '경기 데이터를 찾을 수 없습니다.');
    }

    score.updateScores(kuScore, yuScore);
    await this.scorePersister.save(score);

    await this.scorePubSubService.publishScore(score.toPrimitives());
  }

  @Transactional()
  async resetScore(sport: Sport): Promise<void> {
    const score = await this.scoreReader.findBySport(sport);
    if (!score) {
      throw new DomainException('SCORE', '경기 데이터를 찾을 수 없습니다.');
    }

    score.reset();
    await this.scorePersister.save(score);

    await this.scorePubSubService.publishScore(score.toPrimitives());
  }

  async getScore(sport: Sport): Promise<ScorePrimitives> {
    const score = await this.scoreReader.findBySport(sport);
    if (!score) {
      throw new DomainException('SCORE', '경기 데이터를 찾을 수 없습니다.');
    }

    return score.toPrimitives();
  }
}
