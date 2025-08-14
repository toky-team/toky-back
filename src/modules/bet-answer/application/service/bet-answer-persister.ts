import { Injectable } from '@nestjs/common';

import { BetAnswerRepository } from '~/modules/bet-answer/application/port/out/bet-answer-repository.port';
import { BetAnswer } from '~/modules/bet-answer/domain/model/bet-answer';

@Injectable()
export class BetAnswerPersister {
  constructor(private readonly betAnswerRepository: BetAnswerRepository) {}

  async save(betAnswer: BetAnswer): Promise<void> {
    await this.betAnswerRepository.save(betAnswer);
  }

  async saveAll(betAnswers: BetAnswer[]): Promise<void> {
    await this.betAnswerRepository.saveAll(betAnswers);
  }
}
