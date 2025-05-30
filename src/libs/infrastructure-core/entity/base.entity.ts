import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 모든 엔티티의 공통 기본 컬럼을 정의하는 베이스 엔티티입니다.
 * - id: UUID, 도메인에서 직접 할당
 * - createdAt: 생성 시각, 도메인에서 직접 할당
 * - updatedAt: 수정 시각, 도메인에서 직접 할당
 * - deletedAt: 삭제 시각(soft delete), 도메인에서 직접 할당
 */
export abstract class BaseEntity {
  /** 엔티티의 고유 식별자 (UUID, 도메인에서 직접 할당) */
  @Column({ primary: true, type: 'uuid', comment: '엔티티 고유 식별자(UUID)' })
  id: string;

  /** 생성 시각 (도메인에서 직접 할당) */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', comment: '생성 시각' })
  createdAt: Date;

  /** 수정 시각 (도메인에서 직접 할당) */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', comment: '수정 시각' })
  updatedAt: Date;

  /** 삭제 시각 (soft delete, 도메인에서 직접 할당) */
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
    comment: '삭제 시각(soft delete)',
  })
  deletedAt: Date | null;
}
