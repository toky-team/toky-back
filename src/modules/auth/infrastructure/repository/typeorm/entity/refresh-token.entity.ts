import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { AuthEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/auth.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn({ name: 'auth_id', type: 'uuid', comment: 'Auth 엔티티 ID' })
  authId: string;

  @PrimaryColumn({ name: 'token', type: 'varchar', length: 1024, comment: '리프레시 토큰 값' })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp', comment: '만료 시각' })
  expiresAt: Date;

  @ManyToOne(() => AuthEntity, (auth) => auth.refreshTokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({
    name: 'auth_id',
  })
  auth: AuthEntity;
}
