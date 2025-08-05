import { HttpStatus, Injectable } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { MatchRecord } from '~/modules/match-record/domain/model/match-record';

@Injectable()
export class MatchRecordValidateService {
  public validateCrossRecords(records: MatchRecord[]): void {
    this.validateSameSportConsistency(records);
  }

  public validateSameSportConsistency(records: MatchRecord[]): void {
    const sportGroups = new Map<Sport, MatchRecord[]>();

    // 종목별 그룹화
    for (const record of records) {
      const sport = record.sport;
      if (!sportGroups.has(sport)) {
        sportGroups.set(sport, []);
      }
      sportGroups.get(sport)!.push(record);
    }

    // 각 종목별로 교차 검증
    for (const [_sport, sportRecords] of sportGroups) {
      if (sportRecords.length > 1) {
        this.validateCrossRecordCategoryStatsSchema(sportRecords);
      }
    }
  }

  private validateCrossRecordCategoryStatsSchema(records: MatchRecord[]): void {
    const categorySchemaMap = new Map<string, string[]>();

    for (const record of records) {
      const primitives = record.toPrimitives();

      for (const category of primitives.playerStatsWithCategory) {
        if (category.players.length === 0) continue;

        const currentKeys = category.playerStatKeys.sort();

        if (!categorySchemaMap.has(category.category)) {
          categorySchemaMap.set(category.category, currentKeys);
          continue;
        }

        const referenceKeys = categorySchemaMap.get(category.category)!;

        if (!this.isSameSchema(referenceKeys, currentKeys)) {
          throw new DomainException(
            'MATCH_RECORD',
            `카테고리 "${category.category}"의 stats 구조가 리그 간 일치하지 않습니다. ` +
              `기준: [${referenceKeys.join(', ')}], 현재: [${currentKeys.join(', ')}]`,
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }
  }

  private isSameSchema(keysA: string[], keysB: string[]): boolean {
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key, i) => key === keysB[i]);
  }
}
