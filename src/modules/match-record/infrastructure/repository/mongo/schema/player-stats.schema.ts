import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PlayerStats {
  @Prop({ type: Object, default: {} })
  values: Record<string, number>;
}

export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);
