import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('shares')
@Index('idx_share_user_id', ['userId'])
export class ShareEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'varchar', length: 36, comment: '사용자 ID' })
  userId: string;

  /** 마지막 베팅 공유 일시 */
  @Column({
    name: 'last_bet_shared_at',
    type: 'timestamp',
    comment: '마지막 베팅 공유 일시',
    nullable: true,
  })
  lastBetSharedAt: Date | null;

  /** 마지막 게임 공유 일시 */
  @Column({
    name: 'last_game_shared_at',
    type: 'timestamp',
    comment: '마지막 게임 공유 일시',
    nullable: true,
  })
  lastGameSharedAt: Date | null;
}
