import { RaffleResultDto } from '~/modules/admin/application/dto/raffle-result.dto';

export abstract class AdminFacade {
  abstract isAdmin(userId: string): boolean;
  abstract raffleDraw(
    giftId: string,
    raffleCount: number,
    excludeDrawIds?: string[],
    includeAdmin?: boolean
  ): Promise<RaffleResultDto[]>;
}
