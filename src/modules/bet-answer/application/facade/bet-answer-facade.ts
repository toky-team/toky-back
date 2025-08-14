import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { MatchResultRatioDto } from '~/modules/bet-answer/application/dto/match-result-ratio.dto';
import { BetAnswerFacade } from '~/modules/bet-answer/application/port/in/bet-answer-facade.port';
import { BetAnswerPersister } from '~/modules/bet-answer/application/service/bet-answer-persister';
import { BetAnswerReader } from '~/modules/bet-answer/application/service/bet-answer-reader';
import { BetAnswer, BetAnswerPrimitives } from '~/modules/bet-answer/domain/model/bet-answer';

@Injectable()
export class BetAnswerFacadeImpl extends BetAnswerFacade {
  constructor(
    private readonly betAnswerReader: BetAnswerReader,
    private readonly betAnswerPersister: BetAnswerPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async createOrUpdateBetAnswer(
    userId: string,
    sport: Sport,
    predict: {
      matchResult?: MatchResult;
      score?: {
        kuScore: number;
        yuScore: number;
      };
    },
    player: {
      kuPlayerId: string | null;
      yuPlayerId: string | null;
    }
  ): Promise<BetAnswerPrimitives> {
    const { matchResult, score } = predict;
    if (matchResult !== undefined && score !== undefined) {
      throw new DomainException('BET_ANSWER', '예측 정보는 둘 중 하나만 있어야 합니다', HttpStatus.BAD_REQUEST);
    }

    const userPredict = matchResult !== undefined ? matchResult : score;
    if (userPredict === undefined) {
      throw new DomainException('BET_ANSWER', '예측 정보가 없습니다', HttpStatus.BAD_REQUEST);
    }

    const existingAnswer = await this.betAnswerReader.findByUserIdAndSport(userId, sport);
    if (existingAnswer === null) {
      const betAnswer = BetAnswer.create(this.idGenerator.generateId(), userId, sport, userPredict, player);

      await this.betAnswerPersister.save(betAnswer);
      return betAnswer.toPrimitives();
    } else {
      existingAnswer.updatePredict(userPredict);
      existingAnswer.updatePlayer(player);

      await this.betAnswerPersister.save(existingAnswer);
      return existingAnswer.toPrimitives();
    }
  }

  async getBetAnswersByUserId(userId: string): Promise<BetAnswerPrimitives[]> {
    const betAnswers = await this.betAnswerReader.findByUserId(userId);
    return betAnswers.map((betAnswer) => betAnswer.toPrimitives());
  }

  async getBetAnswerByUserIdAndSport(userId: string, sport: Sport): Promise<BetAnswerPrimitives> {
    const betAnswer = await this.betAnswerReader.findByUserIdAndSport(userId, sport);
    if (betAnswer === null) {
      throw new DomainException('BET_ANSWER', '해당 종목에 대한 베팅 답변이 존재하지 않습니다', HttpStatus.BAD_REQUEST);
    }

    return betAnswer.toPrimitives();
  }

  async getMatchResultRatioBySport(sport: Sport): Promise<MatchResultRatioDto> {
    const answers = await this.betAnswerReader.findBySport(sport);
    const allCount = answers.length;

    if (allCount === 0) {
      const ratio = new MatchResultRatioDto();
      ratio[MatchResult.KOREA_UNIVERSITY] = 0;
      ratio[MatchResult.YONSEI_UNIVERSITY] = 0;
      ratio[MatchResult.DRAW] = 0;
      return ratio;
    }

    const kuCount = answers.filter((a) => a.matchResult === MatchResult.KOREA_UNIVERSITY).length;
    const yuCount = answers.filter((a) => a.matchResult === MatchResult.YONSEI_UNIVERSITY).length;
    const drawCount = answers.filter((a) => a.matchResult === MatchResult.DRAW).length;

    const kuRatio = Math.round((kuCount / allCount) * 100);
    const yuRatio = Math.round((yuCount / allCount) * 100);
    const drawRatio = Math.round((drawCount / allCount) * 100);

    const totalRatio = kuRatio + yuRatio + drawRatio;
    const diff = 100 - totalRatio;

    const ratio = new MatchResultRatioDto();
    ratio[MatchResult.KOREA_UNIVERSITY] = kuRatio;
    ratio[MatchResult.YONSEI_UNIVERSITY] = yuRatio;
    ratio[MatchResult.DRAW] = drawRatio;

    if (diff !== 0) {
      if (kuRatio >= yuRatio && kuRatio >= drawRatio) {
        ratio[MatchResult.KOREA_UNIVERSITY] += diff;
      } else if (yuRatio >= drawRatio) {
        ratio[MatchResult.YONSEI_UNIVERSITY] += diff;
      } else {
        ratio[MatchResult.DRAW] += diff;
      }
    }

    return ratio;
  }
}
