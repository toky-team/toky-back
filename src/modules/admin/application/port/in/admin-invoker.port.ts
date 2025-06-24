export abstract class AdminInvoker {
  abstract isAdmin(userId: string): boolean;
}
