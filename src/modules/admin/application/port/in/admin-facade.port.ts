export abstract class AdminFacade {
  abstract isAdmin(userId: string): boolean;
}
