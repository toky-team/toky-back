import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('ticket_counts')
export class TicketCountEntity extends BaseEntity {
  @Column({ name: 'count', type: 'int', comment: '티켓 수' })
  count: number;

  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;
}
