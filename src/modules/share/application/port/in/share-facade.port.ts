export abstract class ShareFacade {
  abstract betShare(userId: string): Promise<void>;
  abstract gameShare(userId: string): Promise<void>;
  abstract hasBetSharedToday(userId: string): Promise<boolean>;
  abstract hasGameSharedToday(userId: string): Promise<boolean>;
}
