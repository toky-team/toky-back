import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('gifts')
@Index('idx_gift_name', ['name'])
@Index('idx_gift_alias', ['alias'])
@Index('idx_gift_required_ticket', ['requiredTicket'])
export class GiftEntity extends BaseEntity {
  /** 선물 이름 */
  @Column({ name: 'name', type: 'varchar', length: 50, comment: '선물 이름' })
  name: string;

  /** 선물 별칭 */
  @Column({ name: 'alias', type: 'varchar', length: 50, comment: '선물 별칭' })
  alias: string;

  /** 필요한 티켓 수 */
  @Column({ name: 'required_ticket', type: 'int', comment: '필요한 티켓 수' })
  requiredTicket: number;

  /** 이미지 URL */
  @Column({ name: 'image_url', type: 'text', comment: '이미지 URL' })
  imageUrl: string;

  /** 이미지 키 */
  @Column({ name: 'image_key', type: 'varchar', length: 255, comment: '이미지 키' })
  imageKey: string;

  /** 응모 횟수 */
  @Column({ name: 'draw_count', type: 'int', comment: '응모 횟수', default: 0 })
  drawCount: number;
}
