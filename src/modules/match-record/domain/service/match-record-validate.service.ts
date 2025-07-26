import { HttpStatus, Injectable } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { MatchRecord } from '~/modules/match-record/domain/model/match-record';

@Injectable()
export class MatchRecordValidateService {
  /**
   * 단일 MatchRecord 내: category별 선수들의 stats 구조 동일성 검증
   */
  public validateInternalCategoryStatsSchema(record: MatchRecord): void {
    for (const category of record.playerRankings) {
      const players = category.players;
      if (players.length <= 1) continue;

      const referenceKeys = this.extractKeys(players[0].stats.toPrimitives());

      for (const player of players.slice(1)) {
        const keys = this.extractKeys(player.stats.toPrimitives());
        if (!this.isSameSchema(referenceKeys, keys)) {
          throw new DomainException(
            'MATCH_RECORD',
            `카테고리 "${category.category}" 내 선수들의 stats 구조가 일치하지 않습니다.`,
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }
  }

  /**
   * 여러 MatchRecord 간: 같은 종목 내 category별 stats 구조 일관성 검증
   */
  public validateCrossRecordCategoryStatsSchema(records: MatchRecord[]): void {
    const categorySchemaMap = new Map<string, string[]>(); // category → reference keys

    for (const record of records) {
      for (const category of record.playerRankings) {
        const players = category.players;
        if (players.length === 0) continue;

        const currentKeys = this.extractKeys(players[0].stats.toPrimitives());

        if (!categorySchemaMap.has(category.category)) {
          categorySchemaMap.set(category.category, currentKeys);
          continue;
        }

        const referenceKeys = categorySchemaMap.get(category.category)!;

        if (!this.isSameSchema(referenceKeys, currentKeys)) {
          throw new DomainException(
            'MATCH_RECORD',
            `카테고리 "${category.category}"의 stats 구조가 리그 간 일치하지 않습니다.`,
            HttpStatus.BAD_REQUEST
          );
        }

        // 나머지 선수들도 내부 일관성 확인
        for (const player of players.slice(1)) {
          const keys = this.extractKeys(player.stats.toPrimitives());
          if (!this.isSameSchema(referenceKeys, keys)) {
            throw new DomainException(
              'MATCH_RECORD',
              `카테고리 "${category.category}"의 stats 구조가 리그 간/내 모두 일치해야 합니다.`,
              HttpStatus.BAD_REQUEST
            );
          }
        }
      }
    }
  }

  /**
   * 종합 검증: 내부 + 외부 모두 수행
   */
  public validateAll(records: MatchRecord[]): void {
    for (const record of records) {
      this.validateInternalCategoryStatsSchema(record);
    }
    this.validateCrossRecordCategoryStatsSchema(records);
  }

  private extractKeys(stats: Record<string, number>): string[] {
    return Object.keys(stats).sort(); // 정렬해서 순서 통일
  }

  private isSameSchema(keysA: string[], keysB: string[]): boolean {
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key, i) => key === keysB[i]);
  }
}
