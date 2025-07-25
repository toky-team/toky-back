import { Sport } from '~/libs/enums/sport';
import { MatchRecordParams } from '~/modules/match-record/application/dto/match-record-params.dto';
import { MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';

export abstract class MatchRecordFacade {
  abstract getMatchRecord(sport: Sport, league: string): Promise<MatchRecordPrimitives>;
  abstract getMatchRecordsBySport(sport: Sport): Promise<MatchRecordPrimitives[]>;
  abstract getAllLeagueNamesBySport(sport: Sport): Promise<string[]>;
  abstract updateMatchRecordsBySport(sport: Sport, records: MatchRecordParams[]): Promise<MatchRecordPrimitives[]>;
}
