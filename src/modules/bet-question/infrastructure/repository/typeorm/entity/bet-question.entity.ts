import { Column, Entity } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { MatchResult } from '~/libs/enums/match-result';
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

  @Column({
    name: 'answer_match_result',
    type: 'enum',
    enum: MatchResult,
    comment: '정답 - 경기 결과',
    nullable: true,
  })
  answerMatchResult: MatchResult | null;

  @Column({
    name: 'answer_ku_score',
    type: 'int',
    comment: '정답 - 고대 점수',
    nullable: true,
  })
  answerKuScore: number | null;

  @Column({
    name: 'answer_yu_score',
    type: 'int',
    comment: '정답 - 연대 점수',
    nullable: true,
  })
  answerYuScore: number | null;

  @Column({
    name: 'answer_ku_player_id',
    type: 'varchar',
    length: 255,
    comment: '정답 - 고대 선수 ID',
    nullable: true,
  })
  answerKuPlayerId: string | null;

  @Column({
    name: 'answer_yu_player_id',
    type: 'varchar',
    length: 255,
    comment: '정답 - 연대 선수 ID',
    nullable: true,
  })
  answerYuPlayerId: string | null;
}
