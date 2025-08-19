import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('player_likes')
@Index('idx_player_like_user_id', ['userId'])
@Index('idx_player_like_player_id', ['playerId'])
@Index('idx_player_like_user_player', ['userId', 'playerId'])
export class PlayerLikeEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  /** 플레이어 ID */
  @Column({ name: 'player_id', type: 'uuid', comment: '플레이어 ID' })
  playerId: string;
}
