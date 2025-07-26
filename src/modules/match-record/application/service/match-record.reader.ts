import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { MatchRecordRepository } from '~/modules/match-record/application/port/out/match-record-repository.port';
import { MatchRecord } from '~/modules/match-record/domain/model/match-record';

@Injectable()
export class MatchRecordReader {
  constructor(private readonly matchRecordRepository: MatchRecordRepository) {}

  async findBySportAndLeague(sport: Sport, league: string): Promise<MatchRecord | null> {
    return this.matchRecordRepository.findBySportAndLeague(sport, league);
  }

  async findAllBySport(sport: Sport): Promise<MatchRecord[]> {
    return this.matchRecordRepository.findAllBySport(sport);
  }

  async findAllLeagueNamesBySport(sport: Sport): Promise<string[]> {
    return this.matchRecordRepository.findAllLeagueNamesBySport(sport);
  }
}
