import { UserPrimitives } from '~/modules/user/domain/model/user';

export abstract class AdminFacade {
  abstract isAdmin(userId: string): boolean;
  abstract raffleDraw(
    giftId: string,
    raffleCount: number,
    excludeDrawIds?: string[],
    includeAdmin?: boolean
  ): Promise<UserPrimitives[]>;
}
