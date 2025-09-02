import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { BetHitRankDto } from '~/modules/bet-hit/application/dto/bet-hit-rank.dto';
import { BetHitFacade } from '~/modules/bet-hit/application/port/in/bet-hit-facade.port';
import { BetHitPersister } from '~/modules/bet-hit/application/service/bet-hit-persister';
import { BetHitReader } from '~/modules/bet-hit/application/service/bet-hit-reader';
import { BetHit } from '~/modules/bet-hit/domain/model/bet-hit';
import { BetQuestionInvoker } from '~/modules/bet-question/application/port/in/bet-question-invoker.port';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Injectable()
export class BetHitFacadeImpl extends BetHitFacade {
  constructor(
    private readonly betHitReader: BetHitReader,
    private readonly betHitPersister: BetHitPersister,

    private readonly betQuestionInvoker: BetQuestionInvoker,
    private readonly userInvoker: UserInvoker,
    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  async getRanksWithCursor(param: CursorPaginationParam): Promise<PaginatedResult<BetHitRankDto>> {
    const betHits = await this.betHitReader.findWithCursor(param);
    if (betHits.items.length === 0) {
      return {
        items: [],
        hasNext: false,
        nextCursor: null,
      };
    }

    const distinctTotalHitCounts = [...new Set(betHits.items.map((item) => item.totalHitCount))];

    const counts = await Promise.all(
      distinctTotalHitCounts.map((count) => this.betHitReader.countByTotalHitCountGreaterThan(count))
    );
    const rankMap = new Map<number, number>();
    distinctTotalHitCounts.forEach((count, index) => {
      rankMap.set(count, counts[index] + 1);
    });

    const userIds = betHits.items.map((betHit) => betHit.userId);
    const users = await this.userInvoker.getUsersByIds(userIds);
    const userMap = new Map(users.map((user) => [user.id, user]));

    const allSetAnswersCount = await this.betQuestionInvoker.getAllSetAnswersCount();

    const items: BetHitRankDto[] = betHits.items.map((betHit) => {
      const user = userMap.get(betHit.userId) ?? {
        id: betHit.userId,
        name: '알 수 없음',
        university: University.KOREA_UNIVERSITY,
      };
      const rank = rankMap.get(betHit.totalHitCount) ?? 0;
      return {
        userId: user.id,
        username: user.name,
        university: user.university,
        hitRate: allSetAnswersCount > 0 ? Math.round((betHit.totalHitCount / allSetAnswersCount) * 100) : 0,
        rank: rank,
      };
    });
    return {
      items,
      hasNext: betHits.hasNext,
      nextCursor: betHits.nextCursor,
    };
  }

  @Transactional()
  async getRankByUserId(userId: string): Promise<BetHitRankDto> {
    const betHit = await this.getOrCreateBetHit(userId);

    const betterCount = await this.betHitReader.countByTotalHitCountGreaterThan(betHit.totalHitCount);
    const rank = betterCount + 1;

    const user = await this.userInvoker.getUserById(userId);

    const allSetAnswersCount = await this.betQuestionInvoker.getAllSetAnswersCount();

    return {
      userId: user.id,
      username: user.name,
      university: user.university,
      hitRate: allSetAnswersCount > 0 ? Math.round((betHit.totalHitCount / allSetAnswersCount) * 100) : 0,
      rank: rank,
    };
  }

  @Transactional()
  async addMatchResultHit(userId: string, sport: Sport): Promise<void> {
    const betHit = await this.getOrCreateBetHit(userId);
    betHit.updateMatchResultHit(sport, true);
    await this.betHitPersister.save(betHit);
  }

  @Transactional()
  async addScoreHit(userId: string, sport: Sport): Promise<void> {
    const betHit = await this.getOrCreateBetHit(userId);
    betHit.updateScoreHit(sport, true);
    await this.betHitPersister.save(betHit);
  }

  @Transactional()
  async addPlayerHit(userId: string, sport: Sport, university: University): Promise<void> {
    const betHit = await this.getOrCreateBetHit(userId);
    betHit.updatePlayerHit(sport, university, true);
    await this.betHitPersister.save(betHit);
  }

  @Transactional()
  async revertAllHits(sport: Sport): Promise<void> {
    const betHits = await this.betHitReader.findAll();
    for (const betHit of betHits) {
      betHit.updateAllSportHits(sport, false, false, false, false);
    }
    await this.betHitPersister.saveAll(betHits);
  }

  @Transactional()
  private async getOrCreateBetHit(userId: string): Promise<BetHit> {
    const betHit = await this.betHitReader.findByUserId(userId);
    if (betHit !== null) {
      return betHit;
    }

    const newBetHit = BetHit.create(this.idGenerator.generateId(), userId);
    await this.betHitPersister.save(newBetHit);
    return newBetHit;
  }
}
