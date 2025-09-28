import { University } from '~/libs/enums/university';

export interface RaffleResultDto {
  drawId: string;
  userId: string;
  username: string;
  phoneNumber: string;
  university: University;
}
