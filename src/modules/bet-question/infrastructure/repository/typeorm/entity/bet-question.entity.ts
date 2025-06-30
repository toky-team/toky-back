import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { Sport } from '~/libs/enums/sport';

@Entity('bet_questions')
export class BetQuestionEntity extends BaseEntity {
  @Column({
    name: 'sport',
    type: 'enum',
    enum: Sport,
    comment: '경기 종목',
  })
  sport: Sport;

  @Column({
    name: 'order',
    type: 'int',
    comment: '질문 순서',
  })
  order: number;

  @Column({
    name: 'question',
    type: 'varchar',
    comment: '질문 내용',
  })
  question: string;

  @Column({
    name: 'options',
    type: 'varchar',
    comment: '선택지 배열',
    array: true,
  })
  options: string[];
}
