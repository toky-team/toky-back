import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { BetQuestionRepository } from '~/modules/bet-question/application/port/out/bet-question-repository.port';
import { BetQuestion } from '~/modules/bet-question/domain/model/bet-question';
import { BetQuestionEntity } from '~/modules/bet-question/infrastructure/repository/typeorm/entity/bet-question.entity';
import { BetQuestionMapper } from '~/modules/bet-question/infrastructure/repository/typeorm/mapper/bet-question.mapper';

@Injectable()
export class TypeOrmBetQuestionRepository extends BetQuestionRepository {
  constructor(
    @InjectRepository(BetQuestionEntity)
    private readonly ormRepo: Repository<BetQuestionEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: BetQuestion): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: BetQuestion): Promise<void> {
    const entity = BetQuestionMapper.toEntity(aggregate);
    await this.ormRepo.save(entity);
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: BetQuestion[]): Promise<void> {
    const entities = aggregates.map((question) => BetQuestionMapper.toEntity(question));
    await this.ormRepo.save(entities);
    await Promise.all(aggregates.map((question) => this.emitEvent(question)));
  }

  async findById(id: string): Promise<BetQuestion | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
    });
    return entity ? BetQuestionMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<BetQuestion[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => BetQuestionMapper.toDomain(e));
  }

  async findBySport(sport: Sport): Promise<BetQuestion[]> {
    const entities = await this.ormRepo.find({
      where: { sport },
    });
    return entities.map((e) => BetQuestionMapper.toDomain(e));
  }
}
