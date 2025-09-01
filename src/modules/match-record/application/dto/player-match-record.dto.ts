interface LeagueWithStat {
  league: string;
  statKeys: string[];
  stats: Record<string, string>;
}

export interface PlayerMatchRecord {
  playerId: string;
  leagueWithStats: LeagueWithStat[];
}
