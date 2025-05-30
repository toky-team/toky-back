import { Dayjs } from 'dayjs';

import { DateUtil } from '~/libs/utils/date.util';

export abstract class DomainEvent {
  abstract readonly eventName: string;

  constructor(
    public readonly aggregateId: string,
    public readonly occurredAt: Dayjs = DateUtil.now()
  ) {}
}
