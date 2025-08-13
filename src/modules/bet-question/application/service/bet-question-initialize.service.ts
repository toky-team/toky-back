import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionRepository } from '~/modules/bet-question/application/port/out/bet-question-repository.port';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';
import { BetQuestionValidateService } from '~/modules/bet-question/domain/service/bet-question-validate.service';

@Injectable()
export class BetQuestionInitializeService implements OnApplicationBootstrap {
  constructor(
    private readonly betQuestionRepository: BetQuestionRepository,
    private readonly betQuestionValidateService: BetQuestionValidateService,

    private readonly idGenerator: IdGenerator
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.initializeBetQuestions();
  }

  private async initializeBetQuestions(): Promise<void> {
    const sports = Object.values(Sport);
    for (const sport of sports) {
      const questions = await this.betQuestionRepository.findBySport(sport);
      try {
        this.betQuestionValidateService.validateQuestionsWithSport(sport, questions);
      } catch {
        // 질문 초기화
        questions.forEach((question) => question.delete());
        await this.betQuestionRepository.saveAll(questions);
        const newQuestion = this.createDefaultQuestion(sport);
        await this.betQuestionRepository.save(newQuestion);
      }
    }
  }

  private createDefaultQuestion(sport: Sport): BetQuestion {
    const newQuestion = BetQuestion.create(this.idGenerator.generateId(), sport, `${sport} 기본 질문입니다`, null);

    return newQuestion;
  }
}
