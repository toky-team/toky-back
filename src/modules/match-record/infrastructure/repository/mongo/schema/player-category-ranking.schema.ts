import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  PlayerRanking,
  PlayerRankingSchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/player-ranking.schema';

@Schema({ _id: false })
export class PlayerCategoryRanking {
  @Prop({ required: true, type: String })
  category: string;

  @Prop({
    type: [PlayerRankingSchema],
    required: true,
    default: [],
  })
  players: PlayerRanking[];
}

export const PlayerCategoryRankingSchema = SchemaFactory.createForClass(PlayerCategoryRanking);
