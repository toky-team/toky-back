import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { SportHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/sport-hit.entity';

@Entity('bet_hits')
@Index('idx_bet_hit_user_id', ['userId'])
@Index('idx_bet_hit_total_hit_count_id', ['totalHitCount', 'id'])
export class BetHitEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'varchar', length: 36, comment: '사용자 ID' })
  userId: string;

  /** 총 적중 개수 */
  @Column({ name: 'total_hit_count', type: 'int', comment: '총 적중 개수', default: 0 })
  totalHitCount: number;

  /** 관계 매핑 */
  @OneToMany(() => SportHitEntity, (sportHit) => sportHit.betHit, { cascade: true, eager: true })
  sportHits: SportHitEntity[];
}
