import { DateUtil } from '~/libs/utils/date.util';
import { MatchRecord, MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';
import {
  MatchRecordDocument,
  MatchRecordMongo,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/match-record.schema';

export class MatchRecordMapper {
  static toDomain(document: MatchRecordDocument): MatchRecord {
    const primitives: MatchRecordPrimitives = {
      id: document.id,
      sport: document.sport,
      league: document.league,
      imageUrl: document.imageUrl,
      imageKey: document.imageKey,
      universityStatKeys: document.universityStatKeys,

      universityStats: document.universityStats.map((universityStat) => ({
        university: universityStat.university,
        stats: universityStat.stats,
      })),

      playerStatsWithCategory: document.playerStatsWithCategory.map((category) => ({
        category: category.category,
        playerStatKeys: category.playerStatKeys,
        players: category.playerStats.map((player) => ({
          playerId: player.playerId,
          name: player.name,
          university: player.university,
          position: player.position,
          stats: player.stats,
        })),
      })),

      createdAt: DateUtil.fromDate(new Date(document.createdAt)),
      updatedAt: DateUtil.fromDate(new Date(document.updatedAt)),
      deletedAt: document.deletedAt ? DateUtil.fromDate(new Date(document.deletedAt)) : null,
    };

    return MatchRecord.reconstruct(primitives);
  }

  static toMongo(domain: MatchRecord): Partial<MatchRecordMongo> {
    const primitives = domain.toPrimitives();

    return {
      id: primitives.id,
      sport: primitives.sport,
      league: primitives.league,
      imageUrl: primitives.imageUrl,
      imageKey: primitives.imageKey,
      universityStatKeys: primitives.universityStatKeys,

      universityStats: primitives.universityStats.map((universityStat) => ({
        university: universityStat.university,
        stats: universityStat.stats,
      })),

      playerStatsWithCategory: primitives.playerStatsWithCategory.map((category) => ({
        category: category.category,
        playerStatKeys: category.playerStatKeys,
        playerStats: category.players.map((player) => ({
          playerId: player.playerId,
          name: player.name,
          university: player.university,
          position: player.position,
          stats: player.stats,
        })),
      })),

      createdAt: DateUtil.format(primitives.createdAt),
      updatedAt: DateUtil.format(primitives.updatedAt),
      deletedAt: primitives.deletedAt ? DateUtil.format(primitives.deletedAt) : null,
    };
  }
}
