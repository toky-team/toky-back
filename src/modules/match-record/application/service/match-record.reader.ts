import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { PlayerMatchRecord } from '~/modules/match-record/application/dto/player-match-record.dto';
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
    const records = await this.matchRecordRepository.findAllBySport(sport);
    return Array.from(new Set(records.map((record) => record.league)));
  }

  async findPlayerMatchRecords(playerId: string): Promise<PlayerMatchRecord> {
    const matchRecords = await this.matchRecordRepository.findAllByPlayerId(playerId);

    const leagueWithStats: Array<{
      league: string;
      statKeys: string[];
      stats: Record<string, string>;
    }> = [];

    for (const record of matchRecords) {
      const primitives = record.toPrimitives();

      for (const category of primitives.playerStatsWithCategory) {
        const player = category.players.find((p) => p.playerId === playerId);
        if (player) {
          leagueWithStats.push({
            league: `${primitives.league}`,
            statKeys: category.playerStatKeys,
            stats: player.stats,
          });
        }
      }
    }

    const playerMatchRecord: PlayerMatchRecord = {
      playerId,
      leagueWithStats,
    };

    return playerMatchRecord;
  }
}
