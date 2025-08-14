import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { Sport } from '~/libs/enums/sport';
import { MatchRecordRepository } from '~/modules/match-record/application/port/out/match-record-repository.port';
import { MatchRecord } from '~/modules/match-record/domain/model/match-record';
import { MatchRecordMapper } from '~/modules/match-record/infrastructure/repository/mongo/mapper/match-record.mapper';
import {
  MatchRecordDocument,
  MatchRecordMongo,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/match-record.schema';

@Injectable()
export class MongoMatchRecordRepository extends MatchRecordRepository {
  constructor(
    @InjectModel(MatchRecordMongo.name)
    private readonly matchRecordModel: Model<MatchRecordDocument>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: MatchRecord): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(record: MatchRecord): Promise<void> {
    const mongo = MatchRecordMapper.toMongo(record);
    await this.matchRecordModel.findOneAndUpdate({ id: mongo.id }, mongo, { upsert: true, new: true }).exec();
    await this.emitEvent(record);
  }

  async saveAll(records: MatchRecord[]): Promise<void> {
    const bulkOps = records.map((record) => {
      const mongo = MatchRecordMapper.toMongo(record);
      return {
        updateOne: {
          filter: { id: mongo.id },
          update: { $set: mongo },
          upsert: true,
        },
      };
    });

    await this.matchRecordModel.bulkWrite(bulkOps);
    await Promise.all(records.map((record) => this.emitEvent(record)));
  }

  async findBySportAndLeague(sport: Sport, league: string): Promise<MatchRecord | null> {
    const id = MatchRecord.generateId(sport, league);

    const document = await this.matchRecordModel.findOne({ id, deletedAt: null }).exec();
    return document ? MatchRecordMapper.toDomain(document) : null;
  }

  async findAllBySport(sport: Sport): Promise<MatchRecord[]> {
    const documents = await this.matchRecordModel.find({ sport, deletedAt: null }).sort({ league: 1 }).exec();
    return documents.map((doc) => MatchRecordMapper.toDomain(doc));
  }

  async findAllByPlayerId(playerId: string): Promise<MatchRecord[]> {
    const documents = await this.matchRecordModel
      .find({
        'playerStatsWithCategory.playerStats.playerId': playerId,
        deletedAt: null,
      })
      .sort({ league: 1 })
      .exec();

    return documents.map((doc) => MatchRecordMapper.toDomain(doc));
  }
}
