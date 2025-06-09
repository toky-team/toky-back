import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';

@Entity('chat_messages')
export class ChatMessageEntity extends BaseEntity {
  @Column({ name: 'content', type: 'text', comment: '채팅 메시지 내용' })
  content: string;

  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  @Column({ name: 'username', type: 'varchar', length: 100, comment: '사용자 이름' })
  username: string;

  @Column({ name: 'university', type: 'varchar', length: 100, comment: '사용자 소속 대학' })
  university: string;
}
