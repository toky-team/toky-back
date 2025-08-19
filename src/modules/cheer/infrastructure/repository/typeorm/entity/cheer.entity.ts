import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { University } from '~/libs/enums/university';

@Entity('cheers')
@Index('idx_cheer_user_id', ['userId'])
export class CheerEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  /** 응원하는 대학교 */
  @Column({
    name: 'university',
    type: 'enum',
    enum: University,
    comment: '응원하는 대학교',
  })
  university: University;
}
