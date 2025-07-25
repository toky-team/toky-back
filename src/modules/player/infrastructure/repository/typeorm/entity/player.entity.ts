import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';

@Entity('players')
export class PlayerEntity extends BaseEntity {
  /** 선수 이름 */
  @Column({ name: 'name', type: 'varchar', length: 50, comment: '선수 이름' })
  name: string;

  /** 대학교 */
  @Column({
    name: 'university',
    type: 'enum',
    enum: University,
    comment: '대학교',
    default: University.KOREA_UNIVERSITY,
  })
  university: University;

  /** 종목 */
  @Column({
    name: 'sport',
    type: 'enum',
    enum: Sport,
    comment: '종목',
    default: Sport.FOOTBALL,
  })
  sport: Sport;

  /** 학과 */
  @Column({ name: 'department', type: 'varchar', length: 50, comment: '학과' })
  department: string;

  /** 생년월일 (YYYY.MM.DD 형식) */
  @Column({ name: 'birth', type: 'varchar', length: 10, comment: '생년월일 (YYYY.MM.DD 형식)' })
  birth: string;

  /** 키 (cm 단위) */
  @Column({ name: 'height', type: 'int', comment: '키 (cm 단위)' })
  height: number;

  /** 몸무게 (kg 단위) */
  @Column({ name: 'weight', type: 'int', comment: '몸무게 (kg 단위)' })
  weight: number;

  /** 포지션 */
  @Column({ name: 'position', type: 'varchar', length: 20, comment: '포지션' })
  position: string;

  /** 등번호 */
  @Column({ name: 'back_number', type: 'int', comment: '등번호' })
  backNumber: number;

  /** 이미지 URL */
  @Column({ name: 'image_url', type: 'varchar', length: 255, comment: '이미지 URL' })
  imageUrl: string;

  /** 이미지 키 */
  @Column({ name: 'image_key', type: 'varchar', length: 255, comment: '이미지 키' })
  imageKey: string;
}
