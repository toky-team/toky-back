import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { University } from '~/libs/enums/university';

@Schema({ _id: false })
export class PlayerStats {
  @Prop({
    type: String,
    required: false,
    default: null,
  })
  playerId: string | null;

  @Prop({
    required: true,
    type: String,
    index: true,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(University),
    index: true,
  })
  university: University;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  position: string | null;

  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  stats: Record<string, string>;
}

export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);
