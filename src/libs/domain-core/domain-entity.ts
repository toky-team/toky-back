import { Dayjs } from 'dayjs';

import { DateUtil } from '~/libs/utils/date.util';

export abstract class DomainEntity<TPrimitives> {
  constructor(
    public readonly id: string,
    public readonly createdAt: Dayjs,
    public updatedAt: Dayjs,
    public deletedAt: Dayjs | null
  ) {}

  abstract toPrimitives(): TPrimitives;

  equals(entity?: DomainEntity<unknown>): boolean {
    if (!entity) return false;
    if (this === entity) return true;
    return this.constructor.name === entity.constructor.name && this.id === entity.id;
  }

  touch(): void {
    this.updatedAt = DateUtil.now();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  toJSON(): unknown {
    return this.toPrimitives();
  }
}
