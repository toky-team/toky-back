import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { University } from '~/libs/enums/university';

@Schema({ _id: false })
export class UniversityRanking {
  @Prop({ required: true, type: Number })
  rank: number;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(University),
  })
  university: University;

  @Prop({ required: true, type: Number, min: 0 })
  matchCount: number;

  @Prop({ required: true, type: Number, min: 0 })
  winCount: number;

  @Prop({ required: true, type: Number, min: 0 })
  drawCount: number;

  @Prop({ required: true, type: Number, min: 0 })
  loseCount: number;

  @Prop({
    required: true,
    type: Number,
    min: 0,
    max: 1,
  })
  winRate: number;
}

export const UniversityRankingSchema = SchemaFactory.createForClass(UniversityRanking);
