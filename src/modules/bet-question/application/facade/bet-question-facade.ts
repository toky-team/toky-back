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

  async findBySport(sport: Sport): Promise<BetQuestionPrimitives[]> {
    const questions = await this.betQuestionReader.findBySport(sport);
    return questions.map((question) => question.toPrimitives());
  }

  async findAll(): Promise<BetQuestionPrimitives[]> {
    const questions = await this.betQuestionReader.findAll();
    return questions.map((question) => question.toPrimitives());
  }

  @Transactional()
  async updateQuestion(questionId: string, question: string, options: string[]): Promise<BetQuestionPrimitives> {
    const betQuestion = await this.betQuestionReader.findById(questionId);
    if (!betQuestion) {
      throw new DomainException('BET_QUESTION', '질문 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    betQuestion.updateQuestion(question, options);
    await this.betQuestionPersister.save(betQuestion);

    return betQuestion.toPrimitives();
  }
}
