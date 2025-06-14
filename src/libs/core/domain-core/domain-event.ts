import { Dayjs } from 'dayjs';

import { DateUtil } from '~/libs/utils/date.util';

export abstract class DomainEvent {
  static readonly eventName: string;
  readonly eventName: string;

  readonly aggregateId: string;
  readonly userId?: string; // 선택적 사용자 ID
  readonly occurredAt: Dayjs;

  protected constructor(aggregateId: string, userId?: string, occurredAt?: Dayjs) {
    this.aggregateId = aggregateId;
    this.userId = userId;
    this.occurredAt = occurredAt ?? DateUtil.now();
    this.eventName = (this.constructor as typeof DomainEvent).eventName;
  }

  /** 직렬화 */
  abstract toJSON(): Record<string, unknown>;
}

export type EventConstructor<E extends DomainEvent> = {
  new (...args: unknown[]): E;

  // 이벤트 이름을 정의하는 static 속성 정의 필요
  eventName: string;

  // JSON 데이터를 이벤트 객체로 변환하는 static 메서드 정의 필요
  fromJSON(data: Record<string, unknown>): E;
};
