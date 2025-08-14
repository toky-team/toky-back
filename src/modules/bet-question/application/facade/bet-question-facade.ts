import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionFacade } from '~/modules/bet-question/application/port/in/bet-question-facade.port';
import { BetQuestionPersister } from '~/modules/bet-question/application/service/bet-question.persister';
import { BetQuestionReader } from '~/modules/bet-question/application/service/bet-question.reader';
import { BetQuestionPrimitives } from '~/modules/bet-question/domain/model/bet-question';

@Injectable()
export class BetQuestionFacadeImpl extends BetQuestionFacade {
  constructor(
    private readonly betQuestionReader: BetQuestionReader,
    private readonly betQuestionPersister: BetQuestionPersister
  ) {
    super();
  }

  async findBySport(sport: Sport): Promise<BetQuestionPrimitives> {
    const question = await this.betQuestionReader.findBySport(sport);
    if (!question) {
      throw new DomainException('BET_QUESTION', 'Question not found', HttpStatus.NOT_FOUND);
    }
    return question.toPrimitives();
  }

  async findAll(): Promise<BetQuestionPrimitives[]> {
    const questions = await this.betQuestionReader.findAll();
    return questions.map((question) => question.toPrimitives());
  }

  @Transactional()
  async updateQuestion(
    sport: Sport,
    newQuestion: string,
    newPositionFilter: string | null
  ): Promise<BetQuestionPrimitives> {
    const existingQuestion = await this.betQuestionReader.findBySport(sport);
    if (!existingQuestion) {
      throw new DomainException('BET_QUESTION', 'Question not found for the specified sport', HttpStatus.NOT_FOUND);
    }

    existingQuestion.changeQuestion(newQuestion);
    existingQuestion.changeFilter(newPositionFilter);
    await this.betQuestionPersister.save(existingQuestion);

    return existingQuestion.toPrimitives();
  }
}
