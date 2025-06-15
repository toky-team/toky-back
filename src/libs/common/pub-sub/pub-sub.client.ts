/**
 * 발행-구독(Pub-Sub) 패턴을 나타내는 인터페이스
 * 메시지를 발행하고 구독 및 구독취소를 위한 메서드를 제공합니다.
 * 다중 인스턴스 환경에서 모두 동일한 메시지를 수신할 수 있도록 보장합니다.
 */
export abstract class PubSubClient {
  /**
   * 채널에 메시지를 발행합니다.
   * @param channel - 메시지를 발행할 채널 이름
   * @param message - 발행할 메시지 객체
   * @returns 메시지가 성공적으로 발행되면 해결되는 프로미스
   */
  abstract publish(channel: string, message: Record<string, unknown>): Promise<void>;

  /**
   * 채널을 구독하고 메시지를 수신하는 콜백 함수를 등록합니다.
   * @param channel - 구독할 채널 이름
   * @param callback - 메시지를 수신할 때 호출될 콜백 함수
   * @returns 구독이 성공적으로 완료되면 해결되는 프로미스
   */
  abstract subscribe(
    channel: string,
    callback: (message: Record<string, unknown>) => Promise<void> | void
  ): Promise<void>;

  /**
   * 채널의 구독을 취소합니다.
   * @param channel - 구독을 취소할 채널 이름
   * @returns 구독 취소가 성공적으로 완료되면 해결되는 프로미스
   */
  abstract unsubscribe(channel: string): Promise<void>;
}
