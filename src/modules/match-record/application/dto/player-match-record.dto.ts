import { University } from '~/libs/enums/university';

interface LeagueWithStat {
  league: string;
  statKeys: string[];
  stats: Record<string, string>;
}

export interface PlayerMatchRecord {
  playerId: string;
  name: string;
  university: University;
  leagueWithStats: LeagueWithStat[];
}
