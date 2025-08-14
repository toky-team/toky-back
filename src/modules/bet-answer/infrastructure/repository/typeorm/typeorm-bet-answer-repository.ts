import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import {
  BetAnswerFindFilter,
  BetAnswerRepository,
} from '~/modules/bet-answer/application/port/out/bet-answer-repository.port';
import { BetAnswer } from '~/modules/bet-answer/domain/model/bet-answer';
import { BetAnswerEntity } from '~/modules/bet-answer/infrastructure/repository/typeorm/entity/bet-answer.entity';
import { BetAnswerMapper } from '~/modules/bet-answer/infrastructure/repository/typeorm/mapper/bet-answer.mapper';

@Injectable()
export class TypeOrmBetAnswerRepository extends BetAnswerRepository {
  constructor(
    @InjectRepository(BetAnswerEntity)
    private readonly ormRepo: Repository<BetAnswerEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: BetAnswer): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(betAnswer: BetAnswer): Promise<void> {
    const entity = BetAnswerMapper.toEntity(betAnswer);
    await this.ormRepo.save(entity);
    await this.emitEvent(betAnswer);
  }

  async saveAll(betAnswers: BetAnswer[]): Promise<void> {
    const entities = betAnswers.map((betAnswer) => BetAnswerMapper.toEntity(betAnswer));
    await this.ormRepo.save(entities);
    await Promise.all(betAnswers.map((betAnswer) => this.emitEvent(betAnswer)));
  }

  async findById(id: string): Promise<BetAnswer | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
    });
    return entity ? BetAnswerMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<BetAnswer[]> {
    const entities = await this.ormRepo.find();
    return entities.map((entity) => BetAnswerMapper.toDomain(entity));
  }

  async findMany(filter: BetAnswerFindFilter): Promise<BetAnswer[]> {
    const entities = await this.ormRepo.find({
      where: {
        userId: filter.userId,
        sport: filter.sport,
      },
    });

    return entities.map((entity) => BetAnswerMapper.toDomain(entity));
  }
}
