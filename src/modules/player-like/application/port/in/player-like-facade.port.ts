export abstract class PlayerLikeFacade {
  abstract likePlayer(userId: string, playerId: string): Promise<void>;
  abstract unlikePlayer(userId: string, playerId: string): Promise<void>;
  abstract isLikedByUser(userId: string, playerId: string): Promise<boolean>;
}
