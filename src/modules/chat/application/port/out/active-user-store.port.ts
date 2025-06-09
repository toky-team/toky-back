export abstract class ActiveUserStore {
  abstract setOnline(userId: string): Promise<void>;
  abstract refresh(userId: string): Promise<void>;
  abstract remove(userId: string): Promise<void>;
  abstract count(): Promise<number>;
}
