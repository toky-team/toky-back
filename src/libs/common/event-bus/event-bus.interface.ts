import { DomainEvent, EventConstructor } from '~/libs/core/domain-core/domain-event';

/**
 * 도메인 이벤트를 위한 이벤트 버스를 나타내는 인터페이스
 * 이벤트 발행, 구독 및 구독 취소를 위한 메서드를 제공합니다.
 * 다중 인스턴스 환경에서 이벤트가 한 인스턴스에서만 처리되도록 보장합니다.
 */
export abstract class EventBus {
  /**
   * 구독한 모든 핸들러에게 도메인 이벤트를 발행합니다.
   * @template E - 도메인 이벤트를 확장하는 타입
   * @param event - 발행할 도메인 이벤트
   * @returns 이벤트가 발행되면 해결되는 프로미스
   */
  abstract emit<E extends DomainEvent>(event: E): Promise<void>;

  /**
   * 특정 도메인 이벤트 타입에 핸들러를 구독합니다.
   * @template E - 도메인 이벤트를 확장하는 타입
   * @param eventClass - 구독할 이벤트 클래스의 생성자
   * @param handler - 이벤트가 발행될 때 호출될 핸들러 함수
   * @returns 구독이 완료되면 해결되는 프로미스
   */
  abstract subscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void>;

  /**
   * 특정 도메인 이벤트 타입에서 핸들러의 구독을 취소합니다.
   * @template E - 도메인 이벤트를 확장하는 타입
   * @param eventClass - 구독 취소할 이벤트 클래스의 생성자
   * @param handler - 구독 취소할 핸들러 함수
   * @returns 구독 취소가 완료되면 해결되는 프로미스
   */
  abstract unsubscribe<E extends DomainEvent>(
    eventClass: EventConstructor<E>,
    handler: (event: E) => void | Promise<void>
  ): Promise<void>;
}
