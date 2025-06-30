import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { BetQuestionRepository } from '~/modules/bet-question/application/port/out/bet-question-repository.port';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';

@Injectable()
export class BetQuestionReader {
  constructor(private readonly betQuestionRepository: BetQuestionRepository) {}

  async findById(id: string): Promise<BetQuestion | null> {
    return this.betQuestionRepository.findById(id);
  }

  async findAll(): Promise<BetQuestion[]> {
    const questions = await this.betQuestionRepository.findAll();
    questions.sort((a, b) => a.order - b.order);
    return questions;
  }

  async findBySport(sport: Sport): Promise<BetQuestion[]> {
    const questions = await this.betQuestionRepository.findBySport(sport);
    questions.sort((a, b) => a.order - b.order);
    return questions;
  }
}
