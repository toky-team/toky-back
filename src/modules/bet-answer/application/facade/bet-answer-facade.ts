import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { BetSummaryDto } from '~/modules/bet-answer/application/dto/bet-summary.dto';
import { MatchResultRatioDto } from '~/modules/bet-answer/application/dto/match-result-ratio.dto';
import { BetAnswerFacade } from '~/modules/bet-answer/application/port/in/bet-answer-facade.port';
import { BetAnswerPersister } from '~/modules/bet-answer/application/service/bet-answer-persister';
import { BetAnswerReader } from '~/modules/bet-answer/application/service/bet-answer-reader';
import { BetAnswer, BetAnswerPrimitives } from '~/modules/bet-answer/domain/model/bet-answer';
import { BetQuestionInvoker } from '~/modules/bet-question/application/port/in/bet-question-invoker.port';
import { ShareInvoker } from '~/modules/share/application/port/in/share-invoker.port';

@Injectable()
export class BetAnswerFacadeImpl extends BetAnswerFacade {
  constructor(
    private readonly betAnswerReader: BetAnswerReader,
    private readonly betAnswerPersister: BetAnswerPersister,

    private readonly idGenerator: IdGenerator,
    private readonly shareInvoker: ShareInvoker,
    private readonly betQuestionInvoker: BetQuestionInvoker
  ) {
    super();
  }

  @Transactional()
  async predictMatchResult(
    userId: string,
    sport: Sport,
    matchResult?: MatchResult,
    score?: { kuScore: number; yuScore: number }
  ): Promise<BetAnswerPrimitives> {
    if (await this.betQuestionInvoker.isAnswerSet(sport)) {
      throw new DomainException('BET_ANSWER', '이미 정답이 정해진 종목입니다', HttpStatus.BAD_REQUEST);
    }

    if (matchResult !== undefined && score !== undefined) {
      throw new DomainException('BET_ANSWER', '예측 정보는 둘 중 하나만 있어야 합니다', HttpStatus.BAD_REQUEST);
    }

    const userPredict = matchResult !== undefined ? matchResult : score;
    if (userPredict === undefined) {
      throw new DomainException('BET_ANSWER', '예측 정보가 없습니다', HttpStatus.BAD_REQUEST);
    }

    const betAnswer = await this.getOrCreateBetAnswer(userId, sport);
    betAnswer.updatePredict(userPredict);
    await this.betAnswerPersister.save(betAnswer);
    return betAnswer.toPrimitives();
  }

  @Transactional()
  async predictPlayer(
    userId: string,
    sport: Sport,
    university: University,
    playerId: string | null
  ): Promise<BetAnswerPrimitives> {
    if (await this.betQuestionInvoker.isAnswerSet(sport)) {
      throw new DomainException('BET_ANSWER', '이미 정답이 정해진 종목입니다', HttpStatus.BAD_REQUEST);
    }

    const betAnswer = await this.getOrCreateBetAnswer(userId, sport);
    betAnswer.updatePlayer(university, { playerId });
    await this.betAnswerPersister.save(betAnswer);
    return betAnswer.toPrimitives();
  }

  async getBetAnswersByUserId(userId: string): Promise<BetAnswerPrimitives[]> {
    const betAnswers = await Promise.all(Object.values(Sport).map((sport) => this.getOrCreateBetAnswer(userId, sport)));
    return betAnswers.map((betAnswer) => betAnswer.toPrimitives());
  }

  async getBetAnswerByUserIdAndSport(userId: string, sport: Sport): Promise<BetAnswerPrimitives> {
    const betAnswer = await this.getOrCreateBetAnswer(userId, sport);

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

  async getBetSummaryByUserId(userId: string): Promise<BetSummaryDto> {
    const answers = await this.betAnswerReader.findByUserId(userId);
    const kuScore = answers.filter((a) => a.matchResult === MatchResult.KOREA_UNIVERSITY).length;
    const yuScore = answers.filter((a) => a.matchResult === MatchResult.YONSEI_UNIVERSITY).length;

    return { kuScore, yuScore };
  }

  @Transactional()
  async shareBetSummary(userId: string): Promise<boolean> {
    const hasSharedToday = await this.shareInvoker.hasBetSharedToday(userId);
    const isFirstShared = !hasSharedToday;
    await this.shareInvoker.betShare(userId);

    return isFirstShared;
  }

  @Transactional()
  async compareBetAnswer(
    sport: Sport,
    matchResult: MatchResult,
    kuScore: number,
    yuScore: number,
    kuPlayerId: string[],
    yuPlayerId: string[]
  ): Promise<void> {
    const answers = await this.betAnswerReader.findBySport(sport);
    for (const answer of answers) {
      answer.compareAnswer(matchResult, kuScore, yuScore, kuPlayerId, yuPlayerId);
    }

    await this.betAnswerPersister.saveAll(answers);
  }

  @Transactional()
  private async getOrCreateBetAnswer(userId: string, sport: Sport): Promise<BetAnswer> {
    const existingAnswer = await this.betAnswerReader.findByUserIdAndSport(userId, sport);
    if (existingAnswer) {
      return existingAnswer;
    }

    const newAnswer = BetAnswer.create(this.idGenerator.generateId(), userId, sport);
    await this.betAnswerPersister.save(newAnswer);
    return newAnswer;
  }
}
