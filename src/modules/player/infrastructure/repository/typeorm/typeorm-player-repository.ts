import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerFindFilter, PlayerRepository } from '~/modules/player/application/port/out/player-repository.port';
import { Player } from '~/modules/player/domain/model/player';
import { PlayerEntity } from '~/modules/player/infrastructure/repository/typeorm/entity/player.entity';
import { PlayerMapper } from '~/modules/player/infrastructure/repository/typeorm/mapper/player.mapper';

@Injectable()
export class TypeOrmPlayerRepository extends PlayerRepository {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly ormRepo: Repository<PlayerEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: Player): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(player: Player): Promise<void> {
    const entity = PlayerMapper.toEntity(player);
    await this.ormRepo.save(entity);
    await this.emitEvent(player);
  }

  async saveAll(players: Player[]): Promise<void> {
    const entities = players.map((player) => PlayerMapper.toEntity(player));
    await this.ormRepo.save(entities);
    await Promise.all(players.map((player) => this.emitEvent(player)));
  }

  async findById(id: string): Promise<Player | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? PlayerMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Player[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => PlayerMapper.toDomain(e));
  }

  async findByNameAndUniversityAndSport(name: string, university: University, sport: Sport): Promise<Player | null> {
    const entity = await this.ormRepo.findOne({
      where: { name, university, sport },
    });
    return entity ? PlayerMapper.toDomain(entity) : null;
  }

  async findMany(filter: PlayerFindFilter): Promise<Player[]> {
    const entities = await this.ormRepo.find({
      where: {
        university: filter.university,
        sport: filter.sport,
        position: filter.position,
      },
    });
    return entities.map((e) => PlayerMapper.toDomain(e));
  }
}
