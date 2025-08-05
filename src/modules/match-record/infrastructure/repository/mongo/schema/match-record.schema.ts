import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Sport } from '~/libs/enums/sport';
import {
  PlayerStatsWithCategory,
  PlayerStatsWithCategorySchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/player-stats-with-category.schema';
import {
  UniversityStats,
  UniversityStatsSchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/university-stat.schema';

export type MatchRecordDocument = MatchRecordMongo & Document;

@Schema({
  collection: 'match_records',
})
export class MatchRecordMongo {
  @Prop({
    required: true,
    unique: true,
  })
  _id: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(Sport),
  })
  sport: Sport;

  @Prop({
    required: true,
    type: String,
  })
  league: string;

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  universityStatKeys: string[];

  @Prop({
    type: [UniversityStatsSchema],
    required: true,
    default: [],
  })
  universityStats: UniversityStats[];

  @Prop({
    type: [PlayerStatsWithCategorySchema],
    required: true,
    default: [],
  })
  playerStatsWithCategory: PlayerStatsWithCategory[];

  @Prop({
    type: String,
    required: true,
  })
  createdAt: string;

  @Prop({
    type: String,
    required: true,
  })
  updatedAt: string;

  @Prop({
    type: String,
    default: null,
  })
  deletedAt: string | null;
}

export const MatchRecordSchema = SchemaFactory.createForClass(MatchRecordMongo);

MatchRecordSchema.index({ sport: 1, league: 1 }, { unique: true });
MatchRecordSchema.index({ sport: 1, deletedAt: 1 });
MatchRecordSchema.index({ deletedAt: 1 });

MatchRecordSchema.index({
  'playerStatsWithCategory.playerStats.playerId': 1,
  deletedAt: 1,
});
