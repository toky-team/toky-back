import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { University } from '~/libs/enums/university';

@Schema({ _id: false })
export class PlayerRanking {
  @Prop({ type: String, required: false })
  playerId?: string;

  @Prop({ required: true, type: Number })
  rank: number;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(University),
  })
  university: University;

  @Prop({ required: true, type: String })
  position: string;

  @Prop({
    type: Object,
    default: {},
    required: true,
  })
  stats: Record<string, number>;
}

export const PlayerRankingSchema = SchemaFactory.createForClass(PlayerRanking);
