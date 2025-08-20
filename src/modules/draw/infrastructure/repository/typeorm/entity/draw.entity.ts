import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('draws')
@Index('idx_draw_user_id', ['userId'])
@Index('idx_draw_gift_id', ['giftId'])
@Index('idx_draw_user_gift', ['userId', 'giftId'])
export class DrawEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  /** 경품 ID */
  @Column({ name: 'gift_id', type: 'uuid', comment: '경품 ID' })
  giftId: string;
}
