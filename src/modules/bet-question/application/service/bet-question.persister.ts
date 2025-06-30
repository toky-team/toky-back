import { Injectable } from '@nestjs/common';

import { BetQuestionRepository } from '~/modules/bet-question/application/port/out/bet-question-repository.port';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

@Injectable()
export class BetQuestionPersister {
  constructor(private readonly betQuestionRepository: BetQuestionRepository) {}

  async save(aggregate: BetQuestion): Promise<void> {
    await this.betQuestionRepository.save(aggregate);
  }

  async saveAll(aggregates: BetQuestion[]): Promise<void> {
    await this.betQuestionRepository.saveAll(aggregates);
  }
}
