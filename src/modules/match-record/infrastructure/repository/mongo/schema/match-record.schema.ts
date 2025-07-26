import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Sport } from '~/libs/enums/sport';
import {
  PlayerCategoryRanking,
  PlayerCategoryRankingSchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/player-category-ranking.schema';
import {
  UniversityRanking,
  UniversityRankingSchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/university-ranking.schema';

export type MatchRecordDocument = MatchRecordMongo & Document;

@Schema({
  timestamps: true,
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
    index: true,
  })
  sport: Sport;

  @Prop({
    required: true,
    type: String,
    index: true,
  })
  league: string;

  @Prop({
    type: [UniversityRankingSchema],
    required: true,
    default: [],
  })
  universityRankings: UniversityRanking[];

  @Prop({
    type: [PlayerCategoryRankingSchema],
    required: true,
    default: [],
  })
  playerRankings: PlayerCategoryRanking[];

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

  @Prop({ type: String, default: null })
  deletedAt?: string;
}

export const MatchRecordSchema = SchemaFactory.createForClass(MatchRecordMongo);

MatchRecordSchema.index({ sport: 1, league: 1 }, { unique: true });
MatchRecordSchema.index({ deletedAt: 1 });
