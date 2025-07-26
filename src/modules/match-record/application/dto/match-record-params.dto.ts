import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

export class MatchRecordParams {
  sport: Sport;
  league: string;
  universityRankings: {
    rank: number;
    university: University;
    matchCount: number;
    winCount: number;
    drawCount: number;
    loseCount: number;
    winRate: number;
  }[];
  playerRankings: {
    category: string;
    players: {
      rank: number;
      name: string;
      university: University;
      position: string;
      stats: Record<string, number>;
    }[];
  }[];
}
