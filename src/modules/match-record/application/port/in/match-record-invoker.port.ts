import { Sport } from '~/libs/enums/sport';
import { MatchRecordParams } from '~/modules/match-record/application/dto/match-record-params.dto';
import { MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';

export abstract class MatchRecordInvoker {
  abstract updateMatchRecordsBySport(sport: Sport, records: MatchRecordParams[]): Promise<MatchRecordPrimitives[]>;
  abstract setLeagueImage(
    sport: Sport,
    league: string,
    image: Express.Multer.File | null
  ): Promise<MatchRecordPrimitives>;
}
