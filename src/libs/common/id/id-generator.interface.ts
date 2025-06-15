/**
 * 고유 식별자 생성기를 위한 인터페이스
 * 고유한 ID 문자열을 생성하는 메서드를 제공합니다.
 */
export abstract class IdGenerator {
  /**
   * 고유한 ID 문자열을 생성합니다.
   * @returns 새로운 고유 ID 문자열
   */
  abstract generateId(): string;
}
