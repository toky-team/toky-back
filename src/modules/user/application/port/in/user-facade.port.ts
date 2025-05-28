export abstract class UserFacade {
  abstract createUser(name: string, phoneNumber: string, university: string): Promise<void>;
}
