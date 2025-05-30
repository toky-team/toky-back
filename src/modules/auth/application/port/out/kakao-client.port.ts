export abstract class KakaoClient {
  abstract getKakaoUserId(code: string): Promise<string | null>;
}
