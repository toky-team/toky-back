import { Sport } from '~/libs/enums/sport';
import { MatchRecord } from '~/modules/match-record/domain/model/match-record';

export abstract class MatchRecordRepository {
  abstract save(records: MatchRecord): Promise<void>;
  abstract saveAll(records: MatchRecord[]): Promise<void>;
  abstract findBySportAndLeague(sport: Sport, league: string): Promise<MatchRecord | null>;
  abstract findAllBySport(sport: Sport): Promise<MatchRecord[]>;
  abstract findAllByPlayerId(playerId: string): Promise<MatchRecord[]>;
}
