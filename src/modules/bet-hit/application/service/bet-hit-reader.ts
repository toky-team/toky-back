import { Injectable } from '@nestjs/common';

import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { BetHitRepository } from '~/modules/bet-hit/application/port/out/bet-hit-repository.port';
import { BetHit } from '~/modules/bet-hit/domain/model/bet-hit';

@Injectable()
export class BetHitReader {
  constructor(private readonly betHitRepository: BetHitRepository) {}

  async findAll(): Promise<BetHit[]> {
    return this.betHitRepository.findAll();
  }

  async findByUserId(userId: string): Promise<BetHit | null> {
    return this.betHitRepository.findByUserId(userId);
  }

  async countByTotalHitCountGreaterThan(totalHitCount: number): Promise<number> {
    return this.betHitRepository.countByTotalHitCountGreaterThan(totalHitCount);
  }

  async findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<BetHit>> {
    const defaultParam: CursorPaginationParam = {
      limit: cursorParam.limit ?? 20,
      order: cursorParam.order ?? 'DESC',
      cursor: cursorParam.cursor,
    };
    return this.betHitRepository.findWithCursor(defaultParam);
  }
}
