import { University } from '~/libs/enums/university';

export interface ActivityRankDto {
  userId: string;
  username: string;
  university: University;
  score: number;
  rank: number;
}
