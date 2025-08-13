import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { Sport } from '~/libs/enums/sport';

@Entity('bet_questions')
export class BetQuestionEntity extends BaseEntity {
  @Column({
    name: 'sport',
    type: 'enum',
    enum: Sport,
    comment: '종목',
  })
  sport: Sport;

  @Column({
    name: 'question',
    type: 'varchar',
    length: 255,
    comment: '질문',
  })
  question: string;

  @Column({
    name: 'position_filter',
    type: 'varchar',
    length: 255,
    comment: '포지션 필터',
    nullable: true,
  })
  positionFilter: string | null;
}
