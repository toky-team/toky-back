/**
 * 분산 락 인터페이스
 * 분산 환경에서 동시성 제어를 위한 락 메커니즘을 제공합니다.
 */
export abstract class DistributedLock {
  /**
   * 분산 락 획득
   * @param key 락 키
   * @param ttl 락 유지 시간 (밀리초)
   * @param retryDelay 재시도 간격 (밀리초)
   * @param maxRetries 최대 재시도 횟수
   * @returns 락 값 (성공) 또는 null (실패)
   */
  abstract acquireLock(key: string, ttl?: number, retryDelay?: number, maxRetries?: number): Promise<string | null>;

  /**
   * 분산 락 해제
   * @param key 락 키
   * @param lockValue 락 값 (획득 시 반환된 값)
   * @returns 해제 성공 여부
   */
  abstract releaseLock(key: string, lockValue: string): Promise<boolean>;

  /**
   * 락과 함께 작업 실행
   * @param key 락 키
   * @param operation 실행할 작업
   * @param ttl 락 유지 시간 (밀리초)
   * @returns 작업 결과
   */
  abstract withLock<T>(key: string, operation: () => Promise<T>, ttl?: number): Promise<T>;
}
