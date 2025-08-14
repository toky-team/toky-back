import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { MatchResult } from '~/libs/enums/match-result';
import { Sport } from '~/libs/enums/sport';

@Entity('bet_answers')
@Index('idx_bet_answer_user_sport', ['userId', 'sport'])
@Index('idx_bet_answer_sport', ['sport'])
@Index('idx_bet_answer_match_result', ['matchResult'])
export class BetAnswerEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  /** 스포츠 종목 */
  @Column({
    name: 'sport',
    type: 'enum',
    enum: Sport,
    comment: '스포츠 종목',
  })
  sport: Sport;

  /** 경기 결과 예측 */
  @Column({
    name: 'match_result',
    type: 'enum',
    enum: MatchResult,
    comment: '경기 결과 예측',
  })
  matchResult: MatchResult;

  /** 점수 예측 여부 */
  @Column({ name: 'score_predicted', type: 'boolean', comment: '점수 예측 여부', default: false })
  scorePredicted: boolean;

  /** 고려대학교 예측 점수 */
  @Column({ name: 'ku_score', type: 'integer', comment: '고려대학교 예측 점수', nullable: true })
  kuScore: number | null;

  /** 연세대학교 예측 점수 */
  @Column({ name: 'yu_score', type: 'integer', comment: '연세대학교 예측 점수', nullable: true })
  yuScore: number | null;

  /** 고려대학교 선수 ID */
  @Column({ name: 'ku_player_id', type: 'uuid', comment: '고려대학교 선수 ID', nullable: true })
  kuPlayerId: string | null;

  /** 연세대학교 선수 ID */
  @Column({ name: 'yu_player_id', type: 'uuid', comment: '연세대학교 선수 ID', nullable: true })
  yuPlayerId: string | null;
}
