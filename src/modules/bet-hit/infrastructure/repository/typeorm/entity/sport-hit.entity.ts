import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Sport } from '~/libs/enums/sport';
import { BetHitEntity } from '~/modules/bet-hit/infrastructure/repository/typeorm/entity/bet-hit.entity';

@Entity('sport_hits')
@Index('idx_sport_hit_bet_hit_id', ['betHitId'])
@Index('idx_sport_hit_sport', ['sport'])
export class SportHitEntity {
  /** 베팅 적중 ID (복합 기본 키의 일부) */
  @PrimaryColumn({ name: 'bet_hit_id', type: 'uuid', comment: '베팅 적중 ID' })
  betHitId: string;

  /** 종목 (복합 기본 키의 일부) */
  @PrimaryColumn({ name: 'sport', type: 'varchar', length: 50, comment: '스포츠 종목' })
  sport: Sport;

  /** 경기 결과 적중 여부 */
  @Column({ name: 'match_result_hit', type: 'boolean', comment: '경기 결과 적중 여부', default: false })
  matchResultHit: boolean;

  /** 점수 적중 여부 */
  @Column({ name: 'score_hit', type: 'boolean', comment: '점수 적중 여부', default: false })
  scoreHit: boolean;

  /** 고대 선수 적중 여부 */
  @Column({ name: 'ku_player_hit', type: 'boolean', comment: '고대 선수 적중 여부', default: false })
  kuPlayerHit: boolean;

  /** 연대 선수 적중 여부 */
  @Column({ name: 'yu_player_hit', type: 'boolean', comment: '연대 선수 적중 여부', default: false })
  yuPlayerHit: boolean;

  /** 관계 매핑 */
  @ManyToOne(() => BetHitEntity, (betHit) => betHit.sportHits)
  @JoinColumn({ name: 'bet_hit_id' })
  betHit: BetHitEntity;
}
