import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  PlayerStats,
  PlayerStatsSchema,
} from '~/modules/match-record/infrastructure/repository/mongo/schema/player-stat.schema';

@Schema({ _id: false })
export class PlayerStatsWithCategory {
  @Prop({
    required: true,
    type: String,
    index: true,
  })
  category: string;

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  playerStatKeys: string[];

  @Prop({
    type: [PlayerStatsSchema],
    required: true,
    default: [],
  })
  playerStats: PlayerStats[];
}

export const PlayerStatsWithCategorySchema = SchemaFactory.createForClass(PlayerStatsWithCategory);
