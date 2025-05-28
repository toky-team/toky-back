import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';

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
    private readonly ormRepo: Repository<AuthEntity>
  ) {
    super();
  }

  async save(auth: Auth): Promise<void> {
    const entity = AuthMapper.toEntity(auth);
    await this.ormRepo.save(entity);
  }

  async saveAll(aggregates: Auth[]): Promise<void> {
    const entities = aggregates.map((auth) => AuthMapper.toEntity(auth));
    await this.ormRepo.save(entities);
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
