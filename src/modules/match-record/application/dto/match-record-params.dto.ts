import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

export class MatchRecordParams {
  sport: Sport;
  league: string;
  universityStats: {
    university: University;
    stats: Record<string, string>;
  }[];
  playerStatsWithCategory: {
    category: string;
    players: {
      name: string;
      university: University;
      position: string | null;
      stats: Record<string, string>;
    }[];
  }[];
}
