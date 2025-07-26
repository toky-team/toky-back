import { Injectable } from '@nestjs/common';

import { MatchRecordRepository } from '~/modules/match-record/application/port/out/match-record-repository.port';
import { MatchRecord } from '~/modules/match-record/domain/model/match-record';

@Injectable()
export class MatchRecordPersister {
  constructor(private readonly matchRecordRepository: MatchRecordRepository) {}

  async save(matchRecord: MatchRecord): Promise<void> {
    await this.matchRecordRepository.save(matchRecord);
  }

  async saveAll(matchRecords: MatchRecord[]): Promise<void> {
    await this.matchRecordRepository.saveAll(matchRecords);
  }
}
