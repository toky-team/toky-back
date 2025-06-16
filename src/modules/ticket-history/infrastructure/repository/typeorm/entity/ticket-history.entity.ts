import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('ticket_histories')
export class TicketHistoryEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  @Column({ name: 'reason', type: 'varchar', length: 255, comment: '티켓량 변동 사유' })
  reason: string;

  @Column({ name: 'change_amount', type: 'int', comment: '티켓 변화량' })
  changeAmount: number;

  @Column({ name: 'result_amount', type: 'int', comment: '티켓 결과량' })
  resultAmount: number;
}
