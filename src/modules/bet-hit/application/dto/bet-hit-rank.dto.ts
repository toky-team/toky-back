import { University } from '~/libs/enums/university';

export interface BetHitRankDto {
  userId: string;
  username: string;
  university: University;
  hitRate: number;
  rank: number;
}
