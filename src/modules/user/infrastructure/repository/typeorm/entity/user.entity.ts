import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { University } from '~/libs/enums/university';

@Entity('users')
@Index('idx_user_invite_code', ['inviteCode'])
export class UserEntity extends BaseEntity {
  /** 사용자 이름 */
  @Column({ name: 'name', type: 'varchar', length: 50, comment: '사용자 이름' })
  name: string;

  /** 전화번호 (하이픈 포함) */
  @Column({ name: 'phone_number', type: 'varchar', length: 20, comment: '전화번호(하이픈 포함)' })
  phoneNumber: string;

  /** 대학교 */
  @Column({
    name: 'university',
    type: 'enum',
    enum: University,
    comment: '대학교',
    default: University.KOREA_UNIVERSITY,
  })
  university: University;

  /** 초대 코드 */
  @Column({ name: 'invite_code', type: 'varchar', length: 8, comment: '초대 코드', nullable: true })
  inviteCode: string | null;
}
