import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { AuthRepository } from '~/modules/auth/application/port/out/auth-repository.port';
import { Auth } from '~/modules/auth/domain/model/auth';
import { ProviderType } from '~/modules/auth/domain/model/provider.vo';
import { AuthEntity } from '~/modules/auth/infrastructure/repository/typeorm/entity/auth.entity';
import { AuthMapper } from '~/modules/auth/infrastructure/repository/typeorm/mapper/auth.mapper';

@Injectable()
export class TypeOrmAuthRepository extends AuthRepository {
  private authFindOptionsRelation: FindOptionsRelations<AuthEntity> = {
    refreshTokens: true,
  };
  constructor(
    @InjectRepository(AuthEntity)
    private readonly ormRepo: Repository<AuthEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Auth): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(auth: Auth): Promise<void> {
    const entity = AuthMapper.toEntity(auth);

    // 기존 리프레시 토큰들을 모두 삭제하고 새로운 토큰들로 교체
    await this.ormRepo.manager.transaction(async (transactionalEntityManager) => {
      // Auth 엔티티 저장 (refreshTokens 제외)
      const { refreshTokens, ...authToSave } = entity;
      await transactionalEntityManager.save(AuthEntity, authToSave);

      // 기존 리프레시 토큰들 삭제
      await transactionalEntityManager.delete('refresh_tokens', { authId: entity.id });

      // 새로운 리프레시 토큰들 삽입
      if (refreshTokens && refreshTokens.length > 0) {
        await transactionalEntityManager.save('refresh_tokens', refreshTokens);
      }
    });

    await this.emitEvent(auth);
  }

  async saveAll(aggregates: Auth[]): Promise<void> {
    const entities = aggregates.map((auth) => AuthMapper.toEntity(auth));

    await this.ormRepo.manager.transaction(async (transactionalEntityManager) => {
      for (const entity of entities) {
        // Auth 엔티티 저장 (refreshTokens 제외)
        const { refreshTokens, ...authToSave } = entity;
        await transactionalEntityManager.save(AuthEntity, authToSave);

        // 기존 리프레시 토큰들 삭제
        await transactionalEntityManager.delete('refresh_tokens', { authId: entity.id });

        // 새로운 리프레시 토큰들 삽입
        if (refreshTokens && refreshTokens.length > 0) {
          await transactionalEntityManager.save('refresh_tokens', refreshTokens);
        }
      }
    });

    await Promise.all(aggregates.map((auth) => this.emitEvent(auth)));
  }

  async findById(id: string): Promise<Auth | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
      relations: { ...this.authFindOptionsRelation },
    });
    return entity ? AuthMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Auth[]> {
    const entities = await this.ormRepo.find({
      relations: { ...this.authFindOptionsRelation },
    });
    return entities.map((e) => AuthMapper.toDomain(e));
  }

  async findByProvider(providerType: ProviderType, providerId: string): Promise<Auth | null> {
    const entity = await this.ormRepo.findOne({
      where: { providerType, providerId },
      relations: { ...this.authFindOptionsRelation },
    });
    return entity ? AuthMapper.toDomain(entity) : null;
  }
}
