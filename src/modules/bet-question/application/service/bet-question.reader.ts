import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { BetQuestionRepository } from '~/modules/bet-question/application/port/out/bet-question-repository.port';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

@Injectable()
export class BetQuestionReader {
  constructor(private readonly betQuestionRepository: BetQuestionRepository) {}
  async findAll(): Promise<BetQuestion[]> {
    const questions = await this.betQuestionRepository.findAll();
    return questions;
  }

  async findBySport(sport: Sport): Promise<BetQuestion | null> {
    const questions = await this.betQuestionRepository.findBySport(sport);
    return questions.length > 0 ? questions[0] : null;
  }
}
