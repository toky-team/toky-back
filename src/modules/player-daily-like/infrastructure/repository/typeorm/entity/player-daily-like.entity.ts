import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('player_daily_likes')
@Index('idx_player_daily_like_user_id', ['userId'])
@Index('idx_player_daily_like_user_id_created_at', ['userId', 'createdAt'])
export class PlayerDailyLikeEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  /** 일일 좋아요 개수 */
  @Column({ name: 'like_count', type: 'int', default: 0, comment: '일일 좋아요 개수' })
  likeCount: number;
}
