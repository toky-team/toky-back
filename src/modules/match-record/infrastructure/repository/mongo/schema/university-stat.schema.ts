import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { University } from '~/libs/enums/university';

@Schema({ _id: false })
export class UniversityStats {
  @Prop({
    required: true,
    type: String,
    enum: Object.values(University),
    index: true,
  })
  university: University;

  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  stats: Record<string, string>;
}

export const UniversityStatsSchema = SchemaFactory.createForClass(UniversityStats);
