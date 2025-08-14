import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { BetAnswerRepository } from '~/modules/bet-answer/application/port/out/bet-answer-repository.port';
import { BetAnswer } from '~/modules/bet-answer/domain/model/bet-answer';

@Injectable()
export class BetAnswerReader {
  constructor(private readonly betAnswerRepository: BetAnswerRepository) {}

  async findByUserId(userId: string): Promise<BetAnswer[]> {
    return this.betAnswerRepository.findMany({ userId });
  }

  async findBySport(sport: Sport): Promise<BetAnswer[]> {
    return this.betAnswerRepository.findMany({ sport });
  }

  async findByUserIdAndSport(userId: string, sport: Sport): Promise<BetAnswer | null> {
    const betAnswers = await this.betAnswerRepository.findMany({ userId, sport });
    return betAnswers.length > 0 ? betAnswers[0] : null;
  }
}
