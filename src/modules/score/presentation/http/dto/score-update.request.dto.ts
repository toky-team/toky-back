import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ScoreUpdateRequestDto {
  @ApiProperty({
    description: 'KU 점수',
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  kuScore: number;

  @ApiProperty({
    description: 'YU 점수',
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  yuScore: number;
}
