import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { Sport } from '~/libs/enums/sport';

@Entity('live_urls')
@Index('idx_live_url_sport', ['sport'])
export class LiveUrlEntity extends BaseEntity {
  /** 스포츠 종목 */
  @Column({
    name: 'sport',
    type: 'enum',
    enum: Sport,
    comment: '스포츠 종목',
  })
  sport: Sport;

  /** 방송사 명 */
  @Column({ name: 'broadcast_name', type: 'varchar', length: 100, comment: '방송사 명' })
  broadcastName: string;

  /** 라이브 스트리밍 URL */
  @Column({ name: 'url', type: 'text', comment: '라이브 스트리밍 URL' })
  url: string;
}
