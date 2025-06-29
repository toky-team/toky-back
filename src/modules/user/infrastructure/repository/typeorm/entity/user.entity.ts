import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { University } from '~/libs/enums/university';

@Entity('users')
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
}
