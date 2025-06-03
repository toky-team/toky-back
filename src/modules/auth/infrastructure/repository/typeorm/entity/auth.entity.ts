import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '~/libs/core/infrastructure-core/typeorm/base.entity';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';
import { RefreshTokenEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/refresh-token.entity';

@Entity('auths')
export class AuthEntity extends BaseEntity {
  /** 연결된 사용자 ID (nullable, 회원가입 전에는 null) */
  @Column({ name: 'user_id', type: 'uuid', nullable: true, comment: '연결된 사용자 ID' })
  userId: string | null;

  /** 인증 제공자 타입 (KAKAO, KOPAS 등) */
  @Column({ name: 'provider_type', type: 'varchar', length: 20, comment: '인증 제공자 타입' })
  providerType: ProviderType;

  /** 인증 제공자별 식별자 (카카오ID, 고파스ID 등) */
  @Column({ name: 'provider_id', type: 'varchar', length: 100, comment: '인증 제공자별 식별자' })
  providerId: string;

  /** 리프레시 토큰 목록 (연관된 RefreshTokenEntity로 관리) */
  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.auth, {
    cascade: true,
  })
  refreshTokens: RefreshTokenEntity[];
}
