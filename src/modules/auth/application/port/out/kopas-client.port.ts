export abstract class KopasClient {
  abstract getKopasUserId(id: string, password: string): Promise<string | null>;
}
