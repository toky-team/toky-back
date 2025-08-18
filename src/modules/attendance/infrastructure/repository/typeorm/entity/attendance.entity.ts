import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { AttendanceGameStatus } from '~/modules/attendance/domain/model/game-status.vo';

@Entity('attendances')
@Index('idx_attendance_user_id', ['userId'])
@Index('idx_attendance_user_id_attendand_at', ['userId', 'attendandAt'])
@Index('idx_attendance_attendand_at', ['attendandAt'])
export class AttendanceEntity extends BaseEntity {
  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'uuid', comment: '사용자 ID' })
  userId: string;

  /** 출석 일시 */
  @Column({ name: 'attendand_at', type: 'date', comment: '출석 일시' })
  attendandAt: Date;

  /** 게임 상태 */
  @Column({
    name: 'game_status',
    type: 'enum',
    enum: AttendanceGameStatus,
    comment: '게임 상태',
    default: AttendanceGameStatus.NOT_STARTED,
  })
  gameStatus: AttendanceGameStatus;

  /** 1단계 결과 */
  @Column({ name: 'first_stage_result', type: 'boolean', comment: '1단계 결과', nullable: true })
  firstStageResult: boolean | null;

  /** 2단계 결과 */
  @Column({ name: 'second_stage_result', type: 'boolean', comment: '2단계 결과', nullable: true })
  secondStageResult: boolean | null;

  /** 출석 여부 */
  @Column({ name: 'is_attended', type: 'boolean', comment: '출석 여부', default: true })
  isAttended: boolean;
}
