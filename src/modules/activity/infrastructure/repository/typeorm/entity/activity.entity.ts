import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('activities')
@Index('idx_activity_user_id', ['userId'])
@Index('idx_activity_score_id', ['score', 'id'])
export class ActivityEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'varchar', length: 36, comment: '사용자 ID' })
  userId: string;

  /** 점수 */
  @Column({ name: 'score', type: 'int', comment: '활동 점수', default: 0 })
  score: number;
}
