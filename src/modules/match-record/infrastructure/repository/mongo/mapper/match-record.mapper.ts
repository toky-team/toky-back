import { MatchRecord, MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';
import {
  MatchRecordDocument,
  MatchRecordMongo,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/match-record.schema';

export class MatchRecordMapper {
  static toDomain(document: MatchRecordDocument): MatchRecord {
    const primitives: MatchRecordPrimitives = {
      id: document._id,
      sport: document.sport,
      league: document.league,
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

      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt,
    };

    return MatchRecord.reconstruct(primitives);
  }

  static toMongo(domain: MatchRecord): Partial<MatchRecordMongo> {
    const primitives = domain.toPrimitives();

    return {
      _id: primitives.id,
      sport: primitives.sport,
      league: primitives.league,
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

      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
      deletedAt: primitives.deletedAt,
    };
  }
}
