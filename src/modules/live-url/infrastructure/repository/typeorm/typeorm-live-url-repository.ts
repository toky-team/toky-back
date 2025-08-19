import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { LiveUrlRepository } from '~/modules/live-url/application/port/out/live-url-repository.port';
import { LiveUrl } from '~/modules/live-url/domain/model/live-url';
import { LiveUrlEntity } from '~/modules/live-url/infrastructure/repository/typeorm/entity/live-url.entity';
import { LiveUrlMapper } from '~/modules/live-url/infrastructure/repository/typeorm/mapper/live-url.mapper';

@Injectable()
export class TypeOrmLiveUrlRepository extends LiveUrlRepository {
  constructor(
    @InjectRepository(LiveUrlEntity)
    private readonly ormRepo: Repository<LiveUrlEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: LiveUrl): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(liveUrl: LiveUrl): Promise<void> {
    const entity = LiveUrlMapper.toEntity(liveUrl);
    await this.ormRepo.save(entity);
    await this.emitEvent(liveUrl);
  }

  async saveAll(liveUrls: LiveUrl[]): Promise<void> {
    const entities = liveUrls.map((liveUrl) => LiveUrlMapper.toEntity(liveUrl));
    await this.ormRepo.save(entities);
    await Promise.all(liveUrls.map((liveUrl) => this.emitEvent(liveUrl)));
  }

  async findById(id: string): Promise<LiveUrl | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? LiveUrlMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<LiveUrl[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => LiveUrlMapper.toDomain(entity));
  }

  async findBySport(sport: Sport): Promise<LiveUrl[]> {
    const entities = await this.ormRepo.find({ where: { sport } });
    return entities.map((entity) => LiveUrlMapper.toDomain(entity));
  }
}
