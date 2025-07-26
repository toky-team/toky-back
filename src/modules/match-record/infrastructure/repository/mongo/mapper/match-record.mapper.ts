import { MatchRecord, MatchRecordPrimitives } from '~/modules/match-record/domain/model/match-record';
import { MatchRecordMongo } from '~/modules/match-record/infrastructure/repository/mongo/schema/match-record.schema';

export class MatchRecordMapper {
  static toDomain(mongo: MatchRecordMongo): MatchRecord {
    const primitives: MatchRecordPrimitives = {
      id: mongo._id,
      sport: mongo.sport,
      league: mongo.league,
      universityRankings: mongo.universityRankings.map((ur) => ({
        rank: ur.rank,
        university: ur.university,
        matchCount: ur.matchCount,
        winCount: ur.winCount,
        drawCount: ur.drawCount,
        loseCount: ur.loseCount,
        winRate: ur.winRate,
      })),
      playerRankings: mongo.playerRankings.map((pr) => ({
        category: pr.category,
        players: pr.players.map((p) => ({
          playerId: p.playerId || null,
          rank: p.rank,
          name: p.name,
          university: p.university,
          position: p.position,
          stats: p.stats,
        })),
      })),
      createdAt: mongo.createdAt,
      updatedAt: mongo.updatedAt,
      deletedAt: mongo.deletedAt ?? null,
    };

    return MatchRecord.reconstruct(primitives);
  }

  static toMongo(domain: MatchRecord): Partial<MatchRecordMongo> {
    const primitives = domain.toPrimitives();

    return {
      _id: primitives.id,
      sport: primitives.sport,
      league: primitives.league,
      universityRankings: primitives.universityRankings,
      playerRankings: primitives.playerRankings.map((pr) => ({
        category: pr.category,
        players: pr.players.map((p) => ({
          playerId: p.playerId ?? undefined,
          rank: p.rank,
          name: p.name,
          university: p.university,
          position: p.position,
          stats: p.stats,
        })),
      })),
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
      deletedAt: primitives.deletedAt ?? undefined,
    };
  }
}
